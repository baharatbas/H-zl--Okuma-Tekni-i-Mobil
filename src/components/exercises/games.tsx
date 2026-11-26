import React from 'react';
import type { ExerciseKey } from '../../core/exercises/types';
import { RsvpGame, TrackingGame, ZigzagGame } from './attention';
import { FlashNumbersGame, PeripheralGame, StarHunterGame, WordBlocksGame } from './perception';
import { LineScanGame, ScanSearchGame, SkimGame, SynonymGame } from './reading';
import { SchulteGame } from './SchulteGame';
import { ChoiceGame, TypoGame, WordChainGame, WordHuntGame, WordMemoryGame } from './words';
import type { GameProps } from './shell';

/** Egzersiz anahtarına göre doğru oyun bileşenini seçer. Tüm oyunlar tam ekrandır. */
export function ExerciseGame({ exerciseKey, ...props }: GameProps & { exerciseKey: ExerciseKey }) {
  switch (exerciseKey) {
    case 'tracking':
      return <TrackingGame {...props} />;
    case 'zigzag_horizontal':
      return <ZigzagGame {...props} orientation="horizontal" />;
    case 'zigzag_vertical':
      return <ZigzagGame {...props} orientation="vertical" />;
    case 'rsvp_repeat':
      return <RsvpGame {...props} />;
    case 'star_hunter':
      return <StarHunterGame {...props} />;
    case 'flash_numbers':
      return <FlashNumbersGame {...props} />;
    case 'peripheral_letters':
      return <PeripheralGame {...props} />;
    case 'word_blocks':
      return <WordBlocksGame {...props} />;
    case 'schulte':
      return <SchulteGame {...props} />;
    case 'scan_search':
      return <ScanSearchGame {...props} />;
    case 'line_scan':
      return <LineScanGame {...props} />;
    case 'skim_read':
      return <SkimGame {...props} />;
    case 'synonym_match':
      return <SynonymGame {...props} />;
    case 'word_find':
    case 'phrase_group':
    case 'missing_word':
    case 'sentence_finish':
    case 'real_or_fake':
    case 'true_false':
    case 'maze_read':
      return <ChoiceGame {...props} gameKey={exerciseKey} />;
    case 'typo_find':
      return <TypoGame {...props} />;
    case 'word_memory':
      return <WordMemoryGame {...props} />;
    case 'word_chain':
      return <WordChainGame {...props} />;
    case 'word_hunt':
      return <WordHuntGame {...props} />;
  }
}
