export const roster = ["Duncan", "Caelee", "Naqsh", "Mitch", "Ahmed", "Benjamin", "Jessica", "Anas", "Jasim", "Sherjeel", "Mariana"] as const;

export type Mode = "REAL OR FAKE" | "WHO SAID IT" | "FINISH THE MESSAGE";
export type Round = { mode: Mode; author: string; message: string; answer: string; choices: readonly string[]; bonus?: boolean };

export const rounds: Round[] = [
  { mode: "REAL OR FAKE", author: "Duncan", message: "BURN IT ALL DOWN", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Ahmed", message: "LOVE SHANIA TWAIN", answer: "Ahmed", choices: roster },
  { mode: "REAL OR FAKE", author: "Naqsh", message: "chai is a personality trait", answer: "FAKE", choices: ["REAL", "FAKE"] },
  { mode: "FINISH THE MESSAGE", author: "Caelee", message: "Let me tell you about...", answer: "A", choices: ["way back in the 1900's", "the email I just found", "my very first flip phone", "how far behind I am"] },
  { mode: "WHO SAID IT", author: "Benjamin", message: "YOU STOLE MY WIN", answer: "Benjamin", choices: roster },
  { mode: "REAL OR FAKE", author: "Anas", message: "The shape of donut is circle", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "REAL OR FAKE", author: "Jessica", message: "I can still open a PDF, everyone", answer: "FAKE", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Jasim", message: "You can say \"Mazedaar!\" Which translates to Tasty", answer: "Jasim", choices: roster },
  { mode: "FINISH THE MESSAGE", author: "Mitch", message: "What a grate mistake it was...", answer: "C", choices: ["starting all these food jokes.", "not ordering lunch before this.", "missing the cheese puns. I'm quite blue about it", "letting this conversation mature so long."] },
  { mode: "REAL OR FAKE", author: "Ahmed", message: "schrodinger's progress", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Duncan", message: "mine landed on free septic", answer: "Duncan", choices: roster },
  { mode: "REAL OR FAKE", author: "Caelee", message: "I'm two steps behind the learning curve!", answer: "FAKE", choices: ["REAL", "FAKE"] },
  { mode: "FINISH THE MESSAGE", author: "Benjamin", message: "This took so long...", answer: "D", choices: ["the meeting scheduled itself", "I forgot why we started", "the client figured it out", "the ice cream turned into cheese"] },
  { mode: "REAL OR FAKE", author: "Naqsh", message: "yall are amazing but so are my systems", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Jessica", message: "Neither are the correct AAron though", answer: "Jessica", choices: roster, bonus: true },
  { mode: "REAL OR FAKE", author: "Mitch", message: "That sounds like a campaign problem, not a feature.", answer: "FAKE", choices: ["REAL", "FAKE"], bonus: true },
  { mode: "REAL OR FAKE", author: "Anas", message: "Hell yeah", answer: "REAL", choices: ["REAL", "FAKE"], bonus: true },
  { mode: "FINISH THE MESSAGE", author: "Jasim", message: "For me it takes 1,5 hour...", answer: "B", choices: ["if the ingredients are ready first", "to make it the easy to cook one", "but the real recipe takes much longer", "when I cook the powdered version"], bonus: true },
  { mode: "WHO SAID IT", author: "Naqsh", message: "damn", answer: "Naqsh", choices: roster, bonus: true },
  { mode: "REAL OR FAKE", author: "Benjamin", message: "Could be more cursed", answer: "FAKE", choices: ["REAL", "FAKE"], bonus: true },
];
