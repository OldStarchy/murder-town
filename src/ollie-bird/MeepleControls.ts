import type { Axis } from './core/input/Axis';
import Axis2d from './core/input/Axis2d';
import { Button } from './core/input/Button';
import { ButtonsAxis } from './core/input/ButtonsAxis';
import type Gamepad from './core/input/gamepad/Gamepad';
import type { GamepadCode } from './core/input/gamepad/Gamepad';
import { XboxGamepadAxisMap } from './core/input/gamepad/XboxGamepadAxisMap';
import { XboxGamepadButtonMap } from './core/input/gamepad/XboxGamepadButtonMap';
import Keyboard from './core/input/keyboard/Keyboard';
import type Manual from './core/input/manual/Manual';
import type ManualAxis from './core/input/manual/ManualAxis';
import type ManualButton from './core/input/manual/ManualButton';

export interface MeepleControls {
	Walk: Axis2d<Axis>;
	Interact: Button;
	Pause: Button;

	Vibrate?: GamepadHapticActuator;
}

export interface ManualMeepleControls extends MeepleControls {
	Walk: Axis2d<ManualAxis>;
	Interact: ManualButton;
	Pause: ManualButton;
}
export namespace MeepleControls {
	export function fromGamepad(
		gamepad: Gamepad,
		gamepadIndex: GamepadCode,
	): MeepleControls {
		const leftStick = new Axis2d(
			gamepad.getAxis(gamepadIndex, XboxGamepadAxisMap.LeftStickX, 0.3),
			gamepad.getAxis(gamepadIndex, XboxGamepadAxisMap.LeftStickY, 0.3),
		);

		const gamepadX = gamepad.getButton(
			gamepadIndex,
			XboxGamepadButtonMap.X,
		);
		const start = gamepad.getButton(
			gamepadIndex,
			XboxGamepadButtonMap.Start,
		);

		return {
			Walk: leftStick,
			Interact: gamepadX,
			Pause: start,
			Vibrate: gamepad.getVibrationActuator(gamepadIndex),
		};
	}

	export function fromKeyboard(keyboard: Keyboard): MeepleControls {
		const horizontal = new ButtonsAxis(
			keyboard.getButton('ArrowRight'),
			keyboard.getButton('ArrowLeft'),
		);
		const vertical = new ButtonsAxis(
			keyboard.getButton('ArrowDown'),
			keyboard.getButton('ArrowUp'),
		);

		const arrows = new Axis2d(horizontal, vertical);

		const ctrl = keyboard
			.getButton('ControlLeft')
			.merge(keyboard.getButton('Space'));
		const esc = keyboard.getButton('Escape');

		return {
			Walk: arrows,
			Interact: ctrl,
			Pause: esc,
			Vibrate: undefined,
		};
	}

	export function fromManual(manual: Manual): ManualMeepleControls {
		const horizontal = manual.createAxis('Horizontal');
		const vertical = manual.createAxis('Vertical');

		const arrows = new Axis2d(horizontal, vertical);

		const ctrl = manual.createButton('Interact');
		const esc = manual.createButton('Pause');

		return {
			Walk: arrows,
			Interact: ctrl,
			Pause: esc,
			Vibrate: undefined,
		};
	}
}
