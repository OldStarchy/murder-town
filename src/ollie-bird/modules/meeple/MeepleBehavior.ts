import { toss } from 'toss-expression';
import z from 'zod';
import onChange from '../../../react-interop/onChange';
import { CollisionLayer, TAG_DEADLY, TAG_GOAL } from '../../const';
import GameObject from '../../core/GameObject';
import Vec2 from '../../core/math/Vec2';
import Module from '../../core/Module';
import Collider2d from '../../core/modules/Collider2d';
import CircleCollider2d from '../../core/modules/colliders/CircleCollider2d';
import '../../core/monad/OptionResultInterop';
import { Err, Ok, type Result } from '../../core/monad/Result';
import type { MeepleControls } from '../../MeepleControls';
import createExplosionPrefab from '../../prefabs/createExplosionPrefab';
import Checkpoint from '../Checkpoint';
import ExplosionBehavior from '../ExplosionBehavior';
import TriggerableAction from '../interaction/TriggerableAction';
import LevelGameplayManager from '../LevelGameplayManager';
import MeepleNpcController from './MeepleNpcController';

const meepleBehaviorDtoSchema = z.object({
	playerIndex: z.union([z.literal(0), z.literal(1)]),
});
export type MeepleBehaviorDto = z.input<typeof meepleBehaviorDtoSchema>;

export default class MeepleBehavior extends Module {
	static readonly displayName: string = 'Meeple Behavior';

	public readonly velocity: Vec2 = Vec2.zero;

	private levelGameplayManager: LevelGameplayManager;
	private paused: boolean = false;
	@onChange(
		(self) =>
			(self.controls = self.game.input.getSchema<MeepleControls>(
				`Player ${self.playerIndex + 1}`,
			)),
	)
	//TODO: Handle NPC controls somehow
	accessor playerIndex: 0 | 1 = 0;

	private get position(): Vec2 {
		return this.owner.transform.position;
	}

	constructor(owner: GameObject) {
		super(owner);
		this.levelGameplayManager =
			this.owner.game.findModuleByType(LevelGameplayManager) ??
			toss(
				new Error(
					`${MeepleBehavior.displayName} requires a ${LevelGameplayManager.displayName} in the scene`,
				),
			);

		this.personalHitbox = this.addModule(CircleCollider2d);
		this.personalHitbox.radius = 40;
		this.personalHitbox.collisionMask =
			CollisionLayer.Meeple | CollisionLayer.Trigger;

		this.interactionHitbox = this.addModule(CircleCollider2d);
		this.interactionHitbox.radius = 90;
		this.interactionHitbox.collisionMask = CollisionLayer.None;

		this.addModule(TriggerableAction, () => this.handleInteractedWith());
	}

	protected override initialize(): void {
		this.controls =
			this.getModule(MeepleNpcController)?.controls ??
			this.game.input.getSchema<MeepleControls>(
				`Player ${this.playerIndex + 1}`,
			);
	}

	personalHitbox: CircleCollider2d;
	interactionHitbox: CircleCollider2d;

	controls!: MeepleControls;

	togglePause() {
		this.paused = !this.paused;
	}

	#dead = false;
	get dead() {
		return this.#dead;
	}

	private handleInteractedWith() {
		if (this.#dead) return;
		this.die();
	}

	speed = 4.5;

	protected handleInput() {
		this.velocity.copy(
			this.controls.Walk.vec.normalize().scale(this.speed),
		);

		if (this.controls.Interact.isPressed) {
			this.controls.Vibrate?.playEffect('dual-rumble', {
				duration: 500,
				startDelay: 0,
				strongMagnitude: 1.0,
				weakMagnitude: 1.0,
			});

			const objectInTrigger = this.game
				.getObjects()
				.filter((go) => go != this.owner)
				.filter(
					Collider2d.collidingWithCollider(
						this.interactionHitbox,
						CollisionLayer.Trigger,
					),
				)
				.take(1)
				.toArray()[0];

			if (objectInTrigger) {
				objectInTrigger
					.getModulesByType(TriggerableAction)
					.forEach((m) => m.activate());
			}
		}

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.interactionHitbox.center.copy(this.velocity.scale(10));
	}

	protected checkObjCollisions() {
		const myCollider = this.getModule(CircleCollider2d);
		if (!myCollider) return;

		if (
			this.game
				.findObjectsByTag(TAG_DEADLY)
				.some(Collider2d.collidingWith(myCollider.getCollider()))
		) {
			this.die();
		}

		const passedAllGates = !this.game
			.findModulesByType(Checkpoint)
			.some((gate) => gate.state !== 'passed');
		if (
			passedAllGates &&
			this.game
				.findObjectsByTag(TAG_GOAL)
				.some(Collider2d.collidingWith(myCollider.getCollider()))
		) {
			this.levelGameplayManager.handlePlayerReachedGoal(this.owner);
			this.togglePause();

			//spawn explosions in a circle
			for (let i = 0; i < 12; i++) {
				const angle = (i / 12) * Math.PI * 2;
				const x = this.position.x + Math.cos(angle) * 200;
				const y = this.position.y + Math.sin(angle) * 200;

				this.createExplosion(x, y, -20, 100, 1);
			}
			return;
		}
	}

	protected checkOutOfBounds() {
		if (
			this.position.y > this.game.height ||
			this.position.y < 0 ||
			this.position.x < 0 ||
			this.position.x > this.game.width
		) {
			this.die();
		}
	}

	override update() {
		if (this.paused) {
			return;
		}
		if (this.#dead) {
			return;
		}

		this.handleInput();
		this.checkOutOfBounds();
		this.checkObjCollisions();

		super.update();
	}

	private createExplosion(
		x: number,
		y: number,
		radius: number,
		maxRadius: number,
		expansionRate: number,
	) {
		const obj = this.game.spawnPrefab(createExplosionPrefab({ x, y }));
		const explosionBehavior =
			obj.getModule(ExplosionBehavior) ??
			toss(new Error('Explosion prefab is missing ExplosionBehavior'));

		explosionBehavior.radius = radius;
		explosionBehavior.maxRadius = maxRadius;
		explosionBehavior.expansionRate = expansionRate;
	}

	die() {
		this.controls.Vibrate?.playEffect('dual-rumble', {
			duration: 600,
			startDelay: 0,
			strongMagnitude: 1.0,
			weakMagnitude: 1.0,
		});

		this.createExplosion(...this.position.xy, 10, 50, 2);

		this.#dead = true;
		this.velocity.set(0, 0);
		setTimeout(() => (this.#dead = false), 5000);
	}

	serialize(): MeepleBehaviorDto {
		return {
			playerIndex: this.playerIndex,
		};
	}

	static deserialize(
		_obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parseResult = meepleBehaviorDtoSchema.safeParse(_obj);

		if (!parseResult.success) {
			return Err(
				`Failed to deserialize MeepleBehavior: ${parseResult.error.message}`,
			);
		}

		const module = context.gameObject.addModule(this);

		module.playerIndex = parseResult.data.playerIndex;

		return Ok(module);
	}

	static {
		Module.serializer.registerSerializationType('MeepleBehavior', this);
	}
}
