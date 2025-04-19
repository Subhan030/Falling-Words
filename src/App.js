import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import './App.css';

import correctSound from './assets/correct.mp3';
import gameOverSound from './assets/game-over.mp3';
import backgroundMusic from './assets/background.mp3';
const sounds = {
  correct: new Howl({ src: [correctSound], volume: 0.7 }),
  gameOver: new Howl({ src: [gameOverSound], volume: 0.7 }),
  background: new Howl({ 
    src: [backgroundMusic],
    loop: true,
    volume: 0.3
  })
};
const wordList = ["react", "javascript", "game", "coding", "developer", "keyboard", "speed", "challenge"];

function App() {
  const [fallingWords, setFallingWords] = useState([]);
  const [typedText, setTypedText] = useState("");
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const inputRef = useRef(null);
  const gameOverTriggered = useRef(false);

  const toggleSound = () => {
    if (!soundEnabled) {
      sounds.background.play();
    } else {
      sounds.background.stop();
    }
    setSoundEnabled(!soundEnabled);
  };

  useEffect(() => {
    if (gameOver) return;
    
    const wordInterval = setInterval(() => {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      setFallingWords((prev) => [...prev, { word: randomWord, position: 0 }]);
    }, 2000);

    return () => clearInterval(wordInterval);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    
    const fallInterval = setInterval(() => {
      setFallingWords((prev) =>
        prev
          .map((wordObj) => ({ ...wordObj, position: wordObj.position + speed }))
          .filter((wordObj) => {
            if (wordObj.position > 90 && !gameOverTriggered.current) {
              gameOverTriggered.current = true;
              setGameOver(true);
              sounds.background.stop(); // Stop background music when game ends
              if (soundEnabled) sounds.gameOver.play();
              return false;
            }
            return true;
          })
      );

      if (score > 0 && score % 10 === 0) {
        setSpeed((prev) => prev + 0.5);
      }
    }, 100);

    return () => clearInterval(fallInterval);
  }, [speed, score, soundEnabled, gameOver]);

  // Handle typing
  const handleInputChange = (e) => {
    if (gameOver) return;
    
    const input = e.target.value.toLowerCase();
    setTypedText(input);

    const matchedWordIndex = fallingWords.findIndex(
      (wordObj) => wordObj.word.toLowerCase() === input
    );

    if (matchedWordIndex !== -1) {
      if (soundEnabled) sounds.correct.play();
      setFallingWords((prev) => prev.filter((_, index) => index !== matchedWordIndex));
      setScore((prev) => prev + 1);
      setTypedText("");
    }
  };

  // Reset game
  const resetGame = () => {
    setFallingWords([]);
    setTypedText("");
    setScore(0);
    setSpeed(1);
    setGameOver(false);
    gameOverTriggered.current = false;
    
    // Restart background music if sound is enabled
    if (soundEnabled) {
      sounds.background.play();
    }
    
    // Focus input after a small delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="game-container">
      <h1>Catch the Falling Words! 🚀</h1>
      <div className="game-controls">
        <p>Score: {score} | Speed: {speed.toFixed(1)}x</p>
        <button onClick={toggleSound}>
          {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
      </div>
      
      {gameOver ? (
        <div className="game-over">
          <h2>Game Over! Final Score: {score}</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      ) : (
        <>
          <div className="falling-words-container">
            {fallingWords.map((wordObj, index) => (
              <div
                key={index}
                className="falling-word"
                style={{ top: `${wordObj.position}%` }}
              >
                {wordObj.word}
              </div>
            ))}
          </div>
          <input
            type="text"
            ref={inputRef}
            value={typedText}
            onChange={handleInputChange}
            placeholder="Type the words..."
          />
        </>
      )}
    </div>
  );
}

export default App;
