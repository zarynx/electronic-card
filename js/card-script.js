// LETTER CONTENT AND LOCK
const letter = {
  recipient: "Ma'am Rose Anne G. Cochanco",
  date: "November 16, 2026",
  greeting: "Dear Ma'am Roan,",
  paragraphs: [
    "To be honest po, nung una, medyo kinakabahan ako sa inyo. Medyo intimidating po kasi kayo tingnan, especially kapag ikinumpara kay Sir Alex na palaging nakangiti. But as time went by, I started noticing little things about you. I realized na palabiro rin po pala kayo, mahilig makipagkulitan, and you have that side of you na hindi agad nakikita sa unang impression. I guess you're just someone who takes things seriously, and I appreciate that po.",
    "I also want you to know po that even though I wasn't one of the students who got to interact with you that much, I really appreciate the way you teach us. I can see how much effort you put into making sure that we learn. You and Sir Alex are both very down-to-earth po hehe, and I admire how you give your best to your students.",
    "There's actually something about your personality po that reminds me of my older sister. She's also a serious person at first, but once you get to know her, you'll see how playful and cheerful she can be. Maybe that's one of the reasons why I find myself wanting to know you better po. I guess I miss having that kind of bond with my ate, especially now that she's living abroad and we don't get to spend as much time together.",
    "I sometimes wish I had been more confident in approaching you po or joining in on the conversations. I may not have gotten the chance to know you as much as I wanted to, but I'm glad I got to see those little sides of you throughout the semester Ma'am.",
    "If ever we get the chance to have you as our professor again, I hope I get to know you better na po. I hope I get to be a little less shy, too.",
    "Thank you po, Ma'am, for everything you've taught us and for the effort you've given to our class. I hope you continue being the kind of teacher who makes learning a little more meaningful for her students. Take care always po, Ma'am!"
  ],
  closing: "With sincere gratitude,",
  sender: "Jemiah Loraine Baltazar"
};

const lock = {
  cipher: "52 4F 41 4E",
  hint: "Think beyond base ten."
};

// SELECTING ELEMENTS
const cover      = document.getElementById("cover");
const envelope   = document.getElementById("envelope");
const seal       = document.querySelector(".seal");
const caption    = document.getElementById("caption");
const letterCard = document.getElementById("letter");
const letterBody = document.getElementById("letterBody");
const closeBtn   = document.getElementById("closeBtn");
const lockForm   = document.getElementById("lockForm");
const codeBoxes  = document.getElementById("codeBoxes");
const lockMsg    = document.getElementById("lockMsg");
const unlockBtn  = document.getElementById("unlockBtn");
const tapHint    = document.getElementById("tapHint");

// CHECKING CONTENT (trim, length, RegEx)
const namePattern = /^[A-Za-zÀ-ÿ\s.,'-]{2,}$/;
const hexPattern  = /^[0-9A-Fa-f]{2}(\s[0-9A-Fa-f]{2})*$/;
const charPattern = /^[A-Z0-9]$/;
const codePattern = /^[A-Z0-9]+$/;

function cleanText(text, fallback) {
  const cleaned = String(text).trim();
  if (cleaned.length === 0) {
    return fallback;
  }
  return cleaned;
}

function cleanName(name, fallback) {
  const cleaned = String(name).trim();
  if (!namePattern.test(cleaned)) {
    console.error("Invalid name: \"" + name + "\". Using \"" + fallback + "\" instead.");
    return fallback;
  }
  return cleaned;
}

function decodeHex(text) {
  const cleaned = String(text).trim();
  if (!hexPattern.test(cleaned)) {
    console.error("The cipher must be hex pairs separated by single spaces.");
    return "";
  }
  const pairs = cleaned.split(" ");
  let decoded = "";
  for (let i = 0; i < pairs.length; i++) {
    decoded += String.fromCharCode(parseInt(pairs[i], 16));
  }
  return decoded.toUpperCase();
}

const secretCode = decodeHex(lock.cipher);
let unlocked = false;
let busy = false;
let boxes = [];

// BUILDING THE LETTER
function renderLetter() {
  const recipient = cleanName(letter.recipient, "Professor");
  const sender = cleanName(letter.sender, "Your Student");

  let dateText = String(letter.date).trim();
  if (dateText === "") {
    dateText = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  document.getElementById("addressed").textContent = "To: " + recipient;
  document.getElementById("letterDate").textContent = dateText;
  document.getElementById("letterGreeting").textContent = cleanText(letter.greeting, "Dear " + recipient + ",");
  document.getElementById("letterClosing").textContent = cleanText(letter.closing, "Sincerely,");
  document.getElementById("letterSender").textContent = sender;

  letterBody.innerHTML = "";
  for (let i = 0; i < letter.paragraphs.length; i++) {
    const cleaned = String(letter.paragraphs[i]).trim();
    if (cleaned.length > 0) {
      const p = document.createElement("p");
      p.textContent = cleaned;
      letterBody.appendChild(p);
    }
  }

  const initial = sender.match(/[A-Za-zÀ-ÿ]/);
  if (initial) {
    seal.textContent = initial[0].toUpperCase();
  } else {
    seal.textContent = "✦";
  }

  envelope.setAttribute("aria-label", "Sealed letter for " + recipient + ". Enter the code to open it.");
}

// BUILDING THE CODE LOCK
function setMsg(text, isValid) {
  lockMsg.textContent = text;
  if (isValid) {
    lockMsg.className = "lock-msg success-msg";
  } else {
    lockMsg.className = "lock-msg error-msg";
  }
}

function getIndex(box) {
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i] === box) {
      return i;
    }
  }
  return 0;
}

function selectBox(event) {
  event.target.select();
}

function handleBoxInput(event) {
  const box = event.target;
  const index = getIndex(box);
  const typed = box.value.trim().toUpperCase();

  if (typed.length === 0) {
    box.value = "";
  } else if (!charPattern.test(typed)) {
    box.value = "";
    setMsg("Letters and numbers only.", false);
  } else {
    box.value = typed;
    setMsg("", true);
    if (index < boxes.length - 1) {
      boxes[index + 1].focus();
    } else {
      checkCode();
    }
  }
}

function handleBoxKeydown(event) {
  const box = event.target;
  const index = getIndex(box);

  if (event.key === "Backspace" && box.value === "" && index > 0) {
    event.preventDefault();
    boxes[index - 1].value = "";
    boxes[index - 1].focus();
  } else if (event.key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    boxes[index - 1].focus();
  } else if (event.key === "ArrowRight" && index < boxes.length - 1) {
    event.preventDefault();
    boxes[index + 1].focus();
  }
}

function buildLock() {
  if (secretCode.length === 0) {
    unlocked = true;
    lockForm.style.display = "none";
    tapHint.style.display = "block";
    return;
  }

  document.getElementById("cipher").textContent = lock.cipher.trim().split(" ").join(" · ");
  document.getElementById("lockHint").textContent = "Hint: " + cleanText(lock.hint, "No hint this time.");

  for (let i = 0; i < secretCode.length; i++) {
    const box = document.createElement("input");
    box.className = "code-box";
    box.setAttribute("type", "text");
    box.setAttribute("maxlength", "1");
    box.setAttribute("required", "");
    box.setAttribute("autocomplete", "off");
    box.setAttribute("autocapitalize", "characters");
    box.setAttribute("spellcheck", "false");
    box.setAttribute("aria-label", "Code character " + (i + 1) + " of " + secretCode.length);

    box.addEventListener("focus", selectBox);
    box.addEventListener("input", handleBoxInput);
    box.addEventListener("keydown", handleBoxKeydown);

    codeBoxes.appendChild(box);
  }

  boxes = document.querySelectorAll(".code-box");
}

function focusFirstEmpty() {
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].value === "") {
      boxes[i].focus();
      return;
    }
  }
  boxes[0].focus();
}

function clearBoxes() {
  codeBoxes.classList.remove("shake");
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].value = "";
  }
  boxes[0].focus();
}

function rejectCode() {
  codeBoxes.classList.add("shake");
  setTimeout(clearBoxes, 500);
}

// VALIDATING THE CODE
function checkCode() {
  if (unlocked) {
    return;
  }

  let entered = "";
  for (let i = 0; i < boxes.length; i++) {
    entered += boxes[i].value.trim().toUpperCase();
  }

  if (entered.length < secretCode.length) {
    setMsg("Fill in all " + secretCode.length + " boxes.", false);
    focusFirstEmpty();
  } else if (!codePattern.test(entered)) {
    setMsg("Letters and numbers only.", false);
  } else if (entered !== secretCode) {
    setMsg("Incorrect code. Try again.", false);
    rejectCode();
  } else {
    unlocked = true;
    setMsg("✓ The seal is broken.", true);
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].classList.add("solved");
      boxes[i].setAttribute("disabled", "true");
    }
    unlockBtn.setAttribute("disabled", "true");
    setTimeout(openEnvelope, 900);
  }
}

// ANIMATION
function removeSpecks() {
  const specks = document.querySelectorAll(".speck");
  for (let i = 0; i < specks.length; i++) {
    specks[i].remove();
  }
}

function scatterGold() {
  for (let i = 0; i < 14; i++) {
    const speck = document.createElement("span");
    speck.className = "speck";

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    speck.style.setProperty("--dx", Math.cos(angle) * distance + "px");
    speck.style.setProperty("--dy", Math.sin(angle) * distance + "px");

    envelope.appendChild(speck);
  }
  setTimeout(removeSpecks, 1000);
}

function fadeCover() {
  cover.classList.add("away");
}

function showLetter() {
  cover.classList.add("gone");
  letterCard.classList.add("show");
  lockForm.style.display = "none";
  tapHint.style.display = "block";
  busy = false;
}

function openEnvelope() {
  if (!unlocked || busy || envelope.classList.contains("open")) {
    return;
  }
  busy = true;

  envelope.classList.add("open");
  caption.classList.add("hidden");
  scatterGold();

  setTimeout(fadeCover, 2300);
  setTimeout(showLetter, 3000);
}

function unfadeCover() {
  cover.classList.remove("away");
}

function closeEnvelope() {
  envelope.classList.remove("open");
}

function showCaption() {
  caption.classList.remove("hidden");
  busy = false;
}

function closeLetter() {
  if (busy) {
    return;
  }
  busy = true;

  letterCard.classList.remove("show");
  cover.classList.remove("gone");

  setTimeout(unfadeCover, 50);
  setTimeout(closeEnvelope, 800);
  setTimeout(showCaption, 2600);
}

function removeDenied() {
  envelope.classList.remove("denied");
}

function tryEnvelope() {
  if (unlocked) {
    openEnvelope();
  } else {
    setMsg("The seal is locked. Enter the code first.", false);
    envelope.classList.add("denied");
    setTimeout(removeDenied, 450);
    focusFirstEmpty();
  }
}

// EVENTS
function submitLock(event) {
  event.preventDefault();
  checkCode();
}

function envelopeKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    tryEnvelope();
  }
}

if (envelope && letterCard && closeBtn && lockForm) {
  renderLetter();
  buildLock();

  lockForm.addEventListener("submit", submitLock);
  envelope.addEventListener("click", tryEnvelope);
  envelope.addEventListener("keydown", envelopeKeydown);
  closeBtn.addEventListener("click", closeLetter);
} else {
  console.error("Card elements not found. Check the id names in the HTML.");
}
