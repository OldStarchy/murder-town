import { CELL_SIZE } from '../../const';
import type { Pointer } from '../../core/input/Pointer';
import { createDecorationPrefab } from '../../prefabs/createDecorationPrefab';
import Resources from '../../Resources';
import ClickToPlaceTool from './ClickToPlaceTool';

export default class CreateDecorationTool extends ClickToPlaceTool {
	static readonly displayName = 'CreateDecorationTool';

	protected override handleClickToPlace(pointer: Pointer): void {
		this.game.spawnPrefab(createDecorationPrefab(pointer));
	}

	protected override renderToolPreview(
		context: CanvasRenderingContext2D,
	): void {
		Resources.instance.sprite
			.get('tree')
			?.blit(
				context,
				-CELL_SIZE,
				-CELL_SIZE,
				CELL_SIZE * 2,
				CELL_SIZE * 2,
			);
	}
}
