import Axis2d from './core/input/Axis2d';
import { Button } from './core/input/Button';
import { ButtonsAxis } from './core/input/ButtonsAxis';
import type Gamepad from './core/input/gamepad/Gamepad';
import type { GamepadCode } from './core/input/gamepad/Gamepad';
import { XboxGamepadAxisMap } from './core/input/gamepad/XboxGamepadAxisMap';
import { XboxGamepadButtonMap } from './core/input/gamepad/XboxGamepadButtonMap';
import Keyboard from './core/input/keyboard/Keyboard';

export interface MeepleControls {
	Walk: Axis2d;
	Interact: Button;
	Pause: Button;

	Vibrate?: GamepadHapticActuator;
}

export namespace MeepleControls {
	export function fromGamepad(
		gamepad: Gamepad,
		gamepadIndex: GamepadCode,
	): MeepleControls {
		const leftStick = new Axis2d(
			gamepad.getAxis(gamepadIndex, XboxGamepadAxisMap.LeftStickX),
			gamepad.getAxis(gamepadIndex, XboxGamepadAxisMap.LeftStickY),
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
}
