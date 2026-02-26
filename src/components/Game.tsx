import { useEffect, useRef, useState } from 'react';

interface Airline {
  iataCode: string;
  name: string;
  id: string;
}

interface GameProps {
  airlines: Airline[];
}

interface Question {
  correct: Airline;
  options: Airline[];
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomAirlines(airlines: Airline[], count: number, exclude?: Airline): Airline[] {
  const available = exclude ? airlines.filter((airline) => airline.id !== exclude.id) : airlines;
  return shuffle(available).slice(0, count);
}

function createQuestion(airlines: Airline[]): Question {
  const correct = airlines[Math.floor(Math.random() * airlines.length)];
  const incorrectOptions = getRandomAirlines(airlines, 3, correct);

  return {
    correct,
    options: shuffle([correct, ...incorrectOptions]),
  };
}

declare global {
  interface Window {
    __currentCorrectAnswer?: Airline;
  }
}

export default function Game({ airlines }: GameProps) {
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAirlineId, setSelectedAirlineId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [showNextButton, setShowNextButton] = useState(false);
  const hiScoreRef = useRef(0);

  useEffect(() => {
    const storedHiScore = parseInt(localStorage.getItem('airline-hi-score') || '0', 10);
    hiScoreRef.current = storedHiScore;
    setHiScore(storedHiScore);
    setQuestion(createQuestion(airlines));
  }, [airlines]);

  useEffect(() => {
    if (question) {
      window.__currentCorrectAnswer = question.correct;
    }
  }, [question]);

  function loadQuestion() {
    setSelectedAirlineId(null);
    setFeedback('');
    setFeedbackType('');
    setShowNextButton(false);
    setQuestion(createQuestion(airlines));
  }

  function handleAnswer(selectedAirline: Airline) {
    if (!question || selectedAirlineId) {
      return;
    }

    const isCorrect = selectedAirline.id === question.correct.id;
    setSelectedAirlineId(selectedAirline.id);
    setTotalCount((previousTotal) => previousTotal + 1);
    setShowNextButton(true);

    if (isCorrect) {
      setCorrectCount((previousCorrect) => {
        const nextCorrect = previousCorrect + 1;
        if (nextCorrect > hiScoreRef.current) {
          hiScoreRef.current = nextCorrect;
          setHiScore(nextCorrect);
          localStorage.setItem('airline-hi-score', nextCorrect.toString());
        }
        return nextCorrect;
      });

      setStreak((previousStreak) => {
        const nextStreak = previousStreak + 1;
        setFeedback(nextStreak > 1 ? `CORRECT! ${nextStreak}x COMBO!` : 'CORRECT!');
        return nextStreak;
      });
      setFeedbackType('correct');
      return;
    }

    setStreak(0);
    setFeedback(`WRONG! IT WAS ${question.correct.name.toUpperCase()}`);
    setFeedbackType('incorrect');
  }

  return (
    <>
      <div className="hi-score">
        HI-SCORE: <span id="hi-score">{hiScore}</span>
      </div>
      <div className="score">
        SCORE: <span id="correct-count">{correctCount}</span> / <span id="total-count">{totalCount}</span>
      </div>

      <div id="game-container">
        <div className="question-section">
          <div className="prompt">Identify the airline from the IATA code</div>
          <div className="iata-code" id="iata-code">{question?.correct.iataCode ?? '--'}</div>
          <div className="options" id="options-container">
            {question?.options.map((airline) => {
              let className = 'option-button';
              if (selectedAirlineId) {
                if (airline.id === question.correct.id) {
                  className += ' correct';
                } else if (airline.id === selectedAirlineId) {
                  className += ' incorrect';
                }
              }

              return (
                <button
                  key={airline.id}
                  className={className}
                  data-airline-id={airline.id}
                  disabled={Boolean(selectedAirlineId)}
                  onClick={() => handleAnswer(airline)}
                >
                  {airline.name}
                </button>
              );
            })}
          </div>
          <div className={`feedback ${feedbackType}`.trim()} id="feedback">{feedback}</div>
          <button
            className="next-button"
            id="next-button"
            onClick={loadQuestion}
            style={{ visibility: showNextButton ? 'visible' : 'hidden' }}
          >
            NEXT &gt;&gt;
          </button>
        </div>
      </div>
      <div className="insert-coin" id="insert-coin" style={{ display: 'none' }}>
        PRESS START
      </div>
    </>
  );
}
