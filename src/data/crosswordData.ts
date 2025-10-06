import { CrosswordPuzzle } from "@/types";

// IEEE Day Crossword Puzzle Data
export const ieeeeDayPuzzleData: Omit<
  CrosswordPuzzle,
  "id" | "createdBy" | "createdAt"
> = {
  title: "IEEE Day 2025 Tech Challenge",
  description:
    "Test your knowledge about AI, technology, and IEEE with this exciting crossword puzzle!",
  gridSize: { rows: 15, cols: 15 },
  isActive: true,
  clues: [
    // ACROSS clues
    {
      id: "across_2",
      number: 2,
      clue: "AI system that recognizes images",
      answer: "COMPUTERVISION",
      direction: "across",
      startRow: 2,
      startCol: 0,
      length: 14,
      points: 5,
    },
    {
      id: "across_3",
      number: 3,
      clue: "Organization that celebrates technology and engineering worldwide",
      answer: "IEEE",
      direction: "across",
      startRow: 4,
      startCol: 0,
      length: 4,
      points: 5,
    },
    {
      id: "across_6",
      number: 6,
      clue: "Popular AI by OpenAI",
      answer: "CHATGPT",
      direction: "across",
      startRow: 6,
      startCol: 5,
      length: 7,
      points: 5,
    },
    {
      id: "across_7",
      number: 7,
      clue: "Algorithm that improves itself through trial and error",
      answer: "REINFORCEMENT",
      direction: "across",
      startRow: 10,
      startCol: 3,
      length: 12,
      points: 5,
    },
    {
      id: "across_9",
      number: 9,
      clue: "Month when IEEE Day is celebrated",
      answer: "OCTOBER",
      direction: "across",
      startRow: 11,
      startCol: 7,
      length: 7,
      points: 5,
    },
    {
      id: "across_11",
      number: 11,
      clue: "Famous humanoid AI robot",
      answer: "SOPHIA",
      direction: "across",
      startRow: 13,
      startCol: 1,
      length: 6,
      points: 5,
    },

    // DOWN clues
    {
      id: "down_1",
      number: 1,
      clue: "Algorithm that learns patterns from data",
      answer: "MACHINELEARNING",
      direction: "down",
      startRow: 0,
      startCol: 0,
      length: 15,
      points: 5,
    },
    {
      id: "down_4",
      number: 4,
      clue: "Tool that helps predict the future using data",
      answer: "ANALYTICS",
      direction: "down",
      startRow: 2,
      startCol: 3,
      length: 9,
      points: 5,
    },
    {
      id: "down_5",
      number: 5,
      clue: "Device used to travel through time",
      answer: "TIMEMACHINE",
      direction: "down",
      startRow: 2,
      startCol: 8,
      length: 11,
      points: 5,
    },
    {
      id: "down_8",
      number: 8,
      clue: "AI that can generate music or sound",
      answer: "MUSICAL",
      direction: "down",
      startRow: 5,
      startCol: 9,
      length: 7,
      points: 5,
    },
    {
      id: "down_10",
      number: 10,
      clue: "AI that can have conversations with humans",
      answer: "CHATBOT",
      direction: "down",
      startRow: 11,
      startCol: 11,
      length: 7,
      points: 5,
    },
    {
      id: "down_12",
      number: 12,
      clue: "Most popular programming language for AI",
      answer: "PYTHON",
      direction: "down",
      startRow: 13,
      startCol: 4,
      length: 6,
      points: 5,
    },
  ],
};

// Function to create the empty grid layout for crossword
export function createCrosswordGrid(
  puzzle: CrosswordPuzzle
): (string | null)[][] {
  const { rows, cols } = puzzle.gridSize;
  const grid: (string | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  // Create empty grid with null values where words should go
  // This prevents showing answers on the client side
  // The actual answer validation will happen server-side

  return grid;
}

// Function to create grid populated with user answers
export function createCrosswordGridWithAnswers(
  puzzle: CrosswordPuzzle,
  userAnswers: Record<string, string>
): (string | null)[][] {
  const { rows, cols } = puzzle.gridSize;
  const grid: (string | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  // Mark all valid letter positions first
  puzzle.clues.forEach(clue => {
    const { startRow, startCol, direction, length } = clue;
    
    for (let i = 0; i < length; i++) {
      const row = direction === 'across' ? startRow : startRow + i;
      const col = direction === 'across' ? startCol + i : startCol;
      
      if (row < rows && col < cols) {
        // Initialize as empty string if it's a valid letter position
        if (grid[row][col] === null) {
          grid[row][col] = '';
        }
      }
    }
  });

  // Fill in user answers
  puzzle.clues.forEach(clue => {
    const userAnswer = userAnswers[clue.id]?.toUpperCase() || '';
    const { startRow, startCol, direction, length } = clue;
    
    for (let i = 0; i < length && i < userAnswer.length; i++) {
      const row = direction === 'across' ? startRow : startRow + i;
      const col = direction === 'across' ? startCol + i : startCol;
      
      if (row < rows && col < cols) {
        grid[row][col] = userAnswer[i] || '';
      }
    }
  });

  return grid;
}

// Function to get clue numbers for display
export function getClueNumbers(puzzle: CrosswordPuzzle): (number | null)[][] {
  const { rows, cols } = puzzle.gridSize;
  const numbers: (number | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  puzzle.clues.forEach((clue) => {
    const { number, startRow, startCol } = clue;
    if (startRow < rows && startCol < cols) {
      numbers[startRow][startCol] = number;
    }
  });

  return numbers;
}
