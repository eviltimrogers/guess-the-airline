import { useState, useEffect, useCallback } from 'react';

interface Airline {
  iataCode: string;
  name: string;
  id: string;
}

interface GameProps {
  airlines: Airline[];
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomAirlines(airlines: Airline[], count: number, exclude: Airline | null = null): Airline[] {
  const available = exclude
    ? airlines.filter(a => a.id !== exclude.id)
    : airlines;
  const shuffled = shuffle(available);
  return shuffled.slice(0, count);
}

export default function Game({ airlines }: GameProps) {
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState<Airline | null>(null);
  const [options, setOptions] = useState<Airline[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    const stored = parseInt(localStorage.getItem('airline-hi-score') || '0', 10);
    setHiScore(stored);
  }, []);

  const loadQuestion = useCallback(() => {
    setAnswered(false);
    setSelectedId(null);
    setIsCorrect(null);
    setFeedbackText('');

    const correct = airlines[Math.floor(Math.random() * airlines.length)];
    setCurrentCorrectAnswer(correct);
    (window as any).__currentCorrectAnswer = correct;

    const incorrectOptions = getRandomAirlines(airlines, 3, correct);
    const allOptions = shuffle([correct, ...incorrectOptions]);
    setOptions(allOptions);
  }, [airlines]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleAnswer = (selectedAirline: Airline) => {
    if (answered) return;

    setAnswered(true);
    setSelectedId(selectedAirline.id);

    const newTotal = totalCount + 1;
    setTotalCount(newTotal);

    const correct = selectedAirline.id === currentCorrectAnswer!.id;
    setIsCorrect(correct);

    if (correct) {
      const newCorrectCount = correctCount + 1;
      const newStreak = streak + 1;
      setCorrectCount(newCorrectCount);
      setStreak(newStreak);

      const streakText = newStreak > 1 ? ` ${newStreak}x COMBO!` : '';
      setFeedbackText(`CORRECT!${streakText}`);

      if (newCorrectCount > hiScore) {
        setHiScore(newCorrectCount);
        localStorage.setItem('airline-hi-score', newCorrectCount.toString());
      }
    } else {
      setStreak(0);
      setFeedbackText(`WRONG! IT WAS ${currentCorrectAnswer!.name.toUpperCase()}`);
    }
  };

  const getButtonClass = (airline: Airline): string => {
    let cls = 'option-button';
    if (!answered) return cls;
    if (airline.id === selectedId && !isCorrect) {
      cls += ' incorrect';
    }
    if (airline.id === currentCorrectAnswer?.id && (isCorrect || answered)) {
      cls += ' correct';
    }
    return cls;
  };

  const feedbackClass = isCorrect === true ? 'feedback correct' : isCorrect === false ? 'feedback incorrect' : 'feedback';

  return (
    <>
      <h1>&#x2708; GUESS THE AIRLINE</h1>
      <div className="pixel-divider"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <div className="hi-score">HI-SCORE: <span id="hi-score">{hiScore}</span></div>
      <div className="score">
        SCORE: <span id="correct-count">{correctCount}</span> / <span id="total-count">{totalCount}</span>
      </div>

      <div id="game-container">
        <div className="question-section">
          <div className="prompt">Identify the airline from the IATA code</div>
          <div className="iata-code" id="iata-code">{currentCorrectAnswer?.iataCode ?? '--'}</div>
          <div className="options" id="options-container">
            {options.map(airline => (
              <button
                key={airline.id}
                className={getButtonClass(airline)}
                data-airline-id={airline.id}
                disabled={answered}
                onClick={() => handleAnswer(airline)}
              >
                {airline.name}
              </button>
            ))}
          </div>
          <div className={feedbackClass} id="feedback">{feedbackText}</div>
          <button
            className="next-button"
            id="next-button"
            style={{ visibility: answered ? 'visible' : 'hidden' }}
            onClick={loadQuestion}
          >
            NEXT &gt;&gt;
          </button>
        </div>
      </div>
      <div className="insert-coin" id="insert-coin" style={{ display: 'none' }}>PRESS START</div>
    </>
  );
}
