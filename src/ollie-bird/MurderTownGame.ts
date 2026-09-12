import { Layer, TAG_EDITOR_OBJECT, TAG_PLAYER } from './const';
import BaseGame from './core/BaseGame';
import { MeepleControls } from './MeepleControls';
import type { MeepleBehaviorDto } from './modules/meeple/MeepleBehavior';
import { createDecorationPrefab } from './prefabs/createDecorationPrefab';

// Eager-load all the modules so that they're registered in the serializer and available for spawning prefabs
import.meta.glob('./modules/**/*.ts', { eager: true });

export const Bindings = {
	Restart: 'Restart',
} as const;

class MurderTownGame extends BaseGame {
	constructor() {
		super();

		let reset = this.input.keyboard.getButton('KeyR');

		{
			const controllerControls = MeepleControls.fromGamepad(
				this.input.gamepads,
				0,
			);
			// const keyboardControls = MeepleControls.fromKeyboard(
			// 	this.input.keyboard,
			// );

			const player1Controls = controllerControls;
			// const player1Controls = keyboardControls;
			reset = reset.merge(player1Controls.Pause);

			this.input.defineSchema<MeepleControls>(
				'Player 1',
				player1Controls,
			);
		}

		{
			const player2Controls = MeepleControls.fromGamepad(
				this.input.gamepads,
				1,
			);
			reset = reset.merge(player2Controls.Pause);

			this.input.defineSchema<MeepleControls>(
				'Player 2',
				player2Controls,
			);
		}

		// {

		// 	this.input.defineSchema<MeepleControls>(
		// 		'Player 1',
		// 		player2Controls,
		// 	);
		// }

		this.input.defineButton(Bindings.Restart, reset);
	}

	override preStart(): void {
		this.color = 'SkyBlue';
		this.spawnPrefab({
			version: 1,
			layer: 200,
			tags: [TAG_EDITOR_OBJECT],
			name: 'Level Editor',
			modules: [{ $type: 'LevelEditor' }],
		});

		this.spawnPrefab({
			version: 1,
			tags: [TAG_EDITOR_OBJECT],
			name: 'Level Gameplay Manager',
			modules: [{ $type: 'LevelGameplayManager' }],
		});

		this.spawnPrefab(createDecorationPrefab({ x: 400, y: 400 }));

		// const ic = this.spawnPrefab({
		// 	version: 1,
		// 	layer: 1000,
		// 	name: 'Intro Cinematic',
		// });
		// ic.addModule(Cinematic, introCinematic);
		// ic.addModule(CinematicPlayerControl);
		queueMicrotask(() => {
			this.spawnPrefab({
				version: 1,
				layer: Layer.Player,
				tags: [TAG_PLAYER],
				name: 'Player 1',
				transform: [200, 200],
				modules: [
					{
						$type: 'MeepleRenderer',
					},
					{
						$type: 'MeepleBehavior',
						data: {
							playerIndex: 0,
						} satisfies MeepleBehaviorDto,
					},
				],
			});

			this.spawnPrefab({
				version: 1,
				layer: Layer.Player,
				tags: [TAG_PLAYER],
				name: 'Player 2',
				transform: [400, 200],
				modules: [
					{
						$type: 'MeepleRenderer',
					},
					{
						$type: 'MeepleBehavior',
						data: {
							playerIndex: 1,
						} satisfies MeepleBehaviorDto,
					},
				],
			});

			for (let i = 0; i < 48; i++) {
				this.spawnPrefab({
					version: 1,
					layer: Layer.Player,
					tags: [TAG_PLAYER],
					name: 'Player 2',
					transform: [400, 400],
					modules: [
						{
							$type: 'MeepleNpcController',
						},
						{
							$type: 'MeepleRenderer',
						},
						{
							$type: 'MeepleBehavior',
							data: {
								playerIndex: 1,
							} satisfies MeepleBehaviorDto,
						},
					],
				});
			}
		});
	}
}

export default MurderTownGame;
