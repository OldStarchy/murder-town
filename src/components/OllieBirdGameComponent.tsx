import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import MurderTownGame from '../ollie-bird/MurderTownGame';
import GameCanvas from './GameCanvas';
import { GameContext } from './GameContext';
import LevelPicker from './LevelPicker';
import Layout from './layouts/Layout';

function OllieBirdGameComponent() {
	const canvasRef = useRef<{ focus(): void }>(null);
	const [game, setGame] = useState<MurderTownGame>();

	useEffect(() => {
		const game = new MurderTownGame();
		game.start();
		setGame(game);

		return () => {
			game.stop();
			setGame(undefined);
		};
	}, []);

	useEffect(() => {
		canvasRef.current?.focus();
	}, [game]);

	return (
		<ErrorBoundary
			fallbackRender={({ error, resetErrorBoundary }) => (
				<div style={{ padding: 20 }}>
					<h2>Something went wrong:</h2>
					<pre>
						{error instanceof Error ? error.message : String(error)}
					</pre>
					<button onClick={resetErrorBoundary}>Try again</button>
					<button onClick={() => window.location.reload()}>
						Reload
					</button>
				</div>
			)}
		>
			<GameContext.Provider value={game || null}>
				{game && (
					<Layout style={{ width: '100vw', height: '100vh' }}>
						<div
							style={{
								width: '100%',
								height: '100%',
							}}
						>
							<div
								style={{
									position: 'absolute',
									top: 10,
									left: 10,
									zIndex: 1000,
								}}
							>
								<LevelPicker
									onClose={() => canvasRef.current?.focus()}
								/>
							</div>
							<GameCanvas
								game={game}
								ref={canvasRef}
								style={{ width: '100%', height: '100%' }}
							/>
						</div>
					</Layout>
				)}
			</GameContext.Provider>
		</ErrorBoundary>
	);
}

export default OllieBirdGameComponent;
