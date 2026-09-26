import type { DateSuggestion } from '../../types';

export function getDefaultBoardSuggestions(letter: string): DateSuggestion[] {
  return [
    {
      title: `Побачення на літеру «${letter}»`,
      description: `Спільна прогулянка або затишний вечір, натхненний темою на літеру «${letter}».`,
      category: 'romantic',
      estimatedCost: 'budget'
    },
    {
      title: `Кулінарна або творча ідея на «${letter}»`,
      description: `Приготуйте особливу страву або відвідайте нове атмосферне місце на літеру «${letter}».`,
      category: 'food',
      estimatedCost: 'moderate'
    }
  ];
}
