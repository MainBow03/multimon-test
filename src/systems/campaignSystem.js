import { CAMPAIGNS, CHARACTERS } from '../data/gameData.js';

const getCampaignStoryCharacters = (campId) => {
            const camp = CAMPAIGNS.find(c => c.id === campId);
            if (!camp) return [];
            let storyIds = new Set();
            camp.sectors.forEach(sec => {
                sec.missions.forEach(m => {
                    if (m.boss) m.boss.forEach(b => storyIds.add(b));
                    const checkDialogues = (dialogues) => {
                        if (!dialogues) return;
                        dialogues.forEach(d => {
                            const name = d.s.replace(' (Corrotto)', '').replace(' (Corrotta)', '').trim();
                            const char = CHARACTERS.find(c => c.name === name) || CHARACTERS.find(c => c.name.includes(name));
                            if (char) storyIds.add(char.id);
                        });
                    }
                    checkDialogues(m.dialogue);
                    checkDialogues(m.postDialogue);
                });
            });
            storyIds.add('topolino');
            return Array.from(storyIds);
        };

export { getCampaignStoryCharacters };
