export interface NowPageContent {
  lastUpdated: `${number}-${number}`;
  intro: string;
  currentFocus: string[];
  learningTopics: { title: string; detail: string }[];
  currentProjects: { title: string; description: string; context?: string }[];
  beyondCode: { title: string; detail: string }[];
  closingNote: string[];
}

export const nowPageContent: NowPageContent = {
  // Update this month only when the page's content has been reviewed.
  lastUpdated: "2026-10",
  intro:
    "A snapshot of what I'm learning, building, and focusing on at this point in my software development journey. Right now, I'm exploring two different internship experiences while strengthening my skills as a developer.",
  currentFocus: [
    "I'm currently doing two internships: one focused on the MERN stack and another focused on PHP and Laravel.",
    "The MERN stack is already familiar to me, as I've previously worked with JavaScript, React, Next.js, Node.js, and databases. This internship gives me an opportunity to apply what I already know, strengthen my existing skills, and gain more experience working in a professional development environment.",
    "The PHP/Laravel internship is a different kind of opportunity. I've wanted to learn PHP and Laravel for a long time, and when the opportunity came along, I decided to take it. I'm now building my understanding of PHP from the fundamentals before moving on to Laravel.",
    "My current goal is to make the most of both experiences: improve the skills I already have, explore a new backend ecosystem, and become a more versatile software developer.",
  ],
  learningTopics: [
    {
      title: "MERN Stack Development",
      detail: "Applying my existing knowledge of MongoDB, Express.js, React, and Node.js while gaining practical experience through an internship.",
    },
    {
      title: "PHP Fundamentals",
      detail: "Currently my main learning focus. I'm working on understanding PHP syntax, variables, functions, arrays, forms, CRUD operations, and other core concepts before moving forward.",
    },
    {
      title: "Object-Oriented Programming",
      detail: "Preparing to strengthen my understanding of classes, objects, constructors, inheritance, encapsulation, interfaces, and other OOP concepts that will help me work effectively with Laravel.",
    },
    {
      title: "Laravel",
      detail: "My next major learning milestone. I'm preparing my PHP foundation so I can understand Laravel's routing, controllers, models, migrations, Eloquent ORM, validation, and overall application structure more effectively.",
    },
    {
      title: "Professional Development",
      detail: "Learning how to approach problems, write maintainable code, debug independently, and grow through practical work and feedback.",
    },
  ],
  currentProjects: [
    {
      title: "A small PHP notes app",
      description:
        "I'm using small, practical exercises to apply what I'm learning instead of relying entirely on tutorials. Building something functional helps me understand how the concepts work together and gives me a chance to debug problems myself. Alongside this, my MERN internship gives me opportunities to work with a technology stack I'm already comfortable with and continue developing my existing skills.",
      context: "A CRUD learning project with a Bootstrap interface.",
    },
  ],
  beyondCode: [],
  closingNote: [
    "I'm at a stage where I want to strengthen what I already know while making room to learn something new.",
    "The MERN internship lets me build on my existing experience, while the PHP/Laravel internship gives me the opportunity to explore a backend ecosystem I've wanted to learn for a long time.",
    "For now, I'm focusing on learning consistently, building a strong foundation in PHP, and preparing myself to get the most out of Laravel when I move on to it.",
    "That's where my attention is for now. Things will change, and this page will change with them.",
  ],
};
