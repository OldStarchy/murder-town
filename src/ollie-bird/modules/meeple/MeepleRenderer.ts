import { toss } from 'toss-expression';
import z from 'zod';
import contextCheckpoint from '../../../contextCheckpoint';
import GameObject from '../../core/GameObject';
import Vec2 from '../../core/math/Vec2';
import Module from '../../core/Module';
import '../../core/monad/OptionResultInterop';
import type Sprite from '../../core/Sprite';
import Resources from '../../Resources';
import MeepleBehavior from './MeepleBehavior';

const meepleRendererDtoSchema = z.object({});
export type MeepleRendererDto = z.input<typeof meepleRendererDtoSchema>;

export default class MeepleRenderer extends Module {
	static readonly displayName: string = 'MeepleRenderer';

	static readonly raiseToSpreadTime = 0.15;

	private spriteHead: Sprite;
	private spriteBody: Sprite;
	private spriteFeet: Sprite;

	private get position(): Vec2 {
		return this.owner.transform.position;
	}

	private control!: MeepleBehavior;

	constructor(owner: GameObject) {
		super(owner);
		this.spriteBody = Resources.instance.sprite.get('shirtNavy');
		this.spriteHead = Resources.instance.sprite.get('headMedium');
		this.spriteFeet = Resources.instance.sprite.get('legMedium');
	}

	override initialize() {
		this.control =
			this.getModule(MeepleBehavior) ??
			toss('MeepleRenderer needs MeepleControl');
	}

	private animationCycle = 0;

	override update() {
		super.update();

		this.owner.layer = this.transform.position.y;

		const movement = Math.sign(
			this.control.velocity.x || this.control.velocity.y,
		);
		if (movement != 0) {
			const rate = (movement * this.game.secondsPerFrame) / 0.6;
			this.animationCycle = (this.animationCycle + rate + 1) % 1;
		} else {
			this.animationCycle = 0;
		}
	}

	override render(context: CanvasRenderingContext2D) {
		using _ = contextCheckpoint(context);
		context.translate(...this.position.xy);

		{
			using _2 = contextCheckpoint(context);

			const stepHeight = 5;
			const stepRotation = (5 * Math.PI) / 180;
			const legApartDistance = 25;

			context.translate(0, 90);
			switch (Math.floor(this.animationCycle * 4)) {
				case 0:
					break;
				case 1:
					context.translate(0, stepHeight);
					context.rotate(stepRotation);
					break;
				case 2:
					break;
				case 3:
					context.translate(0, stepHeight);
					context.rotate(-stepRotation);
					break;
			}

			this.spriteFeet.blit(context, -legApartDistance - 10, -10, 20, 50);
			this.spriteFeet.blit(context, legApartDistance - 10, -10, 20, 50);
		}
		this.spriteBody.blit(context, -50, 0, 100, 100);
		this.spriteHead.blit(context, -45, -80, 90, 90);
		//These are really arms
		this.spriteFeet.blit(context, -40, 30, 20, 50);
		this.spriteFeet.blit(context, 20, 30, 20, 50);

		super.render(context);
	}

	serialize(): MeepleRendererDto {
		return {};
	}

	static {
		Module.serializer.registerSerializationType('MeepleRenderer', this);
	}
}
