import { Observable, Subject } from 'rxjs';
import z from 'zod';
import contextCheckpoint from '../../../contextCheckpoint';
import onChange from '../../../react-interop/onChange';
import { ReactInterop } from '../../../react-interop/ReactInterop';
import Module from '../../core/Module';
import type { Serializable } from '../../core/Serializer';
import Resources from '../../Resources';

const decorationNames = ['fountain', 'tree', 'bush'] as const;

export const decorationSchema = z.object({
	image: z.enum(decorationNames),
});

type DecorationView = z.infer<typeof decorationSchema>;

export default class Decoration
	extends Module
	implements ReactInterop<DecorationView>, Serializable
{
	static readonly displayName = 'Decoration';
	#change$ = new Subject<void>();

	/**
	 * Indicates a change to one of this objects inspectable properties (name,
	 * tags, layer). Used to trigger updates in the editor.
	 *
	 * This observable completes when this object is destroyed.
	 */
	readonly change$ = this.#change$.asObservable();

	private notify(): void {
		this.#change$.next();
	}

	@onChange((self) => self.notify())
	accessor image: (typeof decorationNames)[number] = decorationNames[0];

	[ReactInterop.get](): DecorationView {
		return {
			image: this.image,
		};
	}

	[ReactInterop.set](value: DecorationView): void {
		this.image = value.image;
	}

	get [ReactInterop.asObservable](): Observable<void> {
		return this.change$;
	}

	readonly [ReactInterop.schema] = decorationSchema;

	protected override update(): void {
		this.owner.layer = this.transform.position.y;
	}

	protected override render(context: CanvasRenderingContext2D): void {
		const sprite = Resources.instance.sprite.get(this.image);

		using _ = contextCheckpoint(context);

		context.translate(...this.owner.transform.position.xy);

		const [w, h] = sprite.sourceRect.wh;
		sprite.blit(context, -w / 2, -h / 2, w, h);
	}

	static {
		Module.serializer.registerSerializationType('Decoration', this);
	}
}
