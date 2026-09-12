import { Layer, TAG_LEVEL_OBJECT } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import Decoration from '../modules/decoration/Decoration';

export function createDecorationPrefab(position: Vec2Like) {
	return {
		version: 1,
		name: 'Some Decoration',
		tags: [TAG_LEVEL_OBJECT],
		layer: Layer.Background,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(Decoration),
			},
		],
	} satisfies GameObjectDto;
}
