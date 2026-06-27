const notes = [
  {
    tag: "THOUGHT",
    title: "先让作品被看见",
    body: "个人主页不需要一次性完美，先上线，再持续替换真实内容。"
  },
  {
    tag: "BUILD",
    title: "把想法做成入口",
    body: "一个链接、一个演示、一个截图，都能让抽象的想法变得更容易被讨论。"
  },
  {
    tag: "WORKFLOW",
    title: "重复三次就自动化",
    body: "如果一件事情已经重复做了三次，就值得花一点时间把它变成模板或脚本。"
  },
  {
    tag: "LIFE",
    title: "给自己留一个客厅",
    body: "主页不是简历的复制品，它可以更松弛，放下阶段性的兴趣和未完成的探索。"
  }
];

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const noteTag = document.querySelector("#note-tag");
const noteTitle = document.querySelector("#note-title");
const noteBody = document.querySelector("#note-body");
const shuffleButton = document.querySelector("#shuffle-note");
let noteIndex = 0;

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", event => {
  if (event.target.tagName === "A") {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

shuffleButton?.addEventListener("click", () => {
  noteIndex = (noteIndex + 1) % notes.length;
  const note = notes[noteIndex];
  noteTag.textContent = note.tag;
  noteTitle.textContent = note.title;
  noteBody.textContent = note.body;
});

document.querySelector("#year").textContent = new Date().getFullYear();
