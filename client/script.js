const QUESTIONS = [
    '',
    'Has your sleep been disturbed recently?', 
    'What would you rate your recent fatigue levels?',
    'Do you tend to feel like you are worthless?',
    'Have you noticed an increase in aggression?',
    'Do you suffer from panic attacks, if so how frequently?',
    'Any drastic changes in appetite?',
];
const ANSWERS = {
    sleep: '',
    fatigue: '',
    worthlessness: '',
    aggression: '',
    'panic attack': '',
    appetite: '',
};
const chatBox = document.querySelector('.chat');
chatBox.innerHTML = ''; // Delete static HTML layout

function typeText(text, container, callback) {
    let charIndex = 0;
    function typeNextChar() {
        if (charIndex < text.length) {
            container.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeNextChar, 50); // Adjust typing speed here
        } else {
            setTimeout(callback, 500); // Delay before calling the callback
        }
    }
    typeNextChar();
}

function createQuestion(questionId) {
    const div = document.createElement('div');
    div.className = 'question q' + questionId;
    return div;
}

function createResponseTemplate(questionId) {
    const div = document.createElement('div');
    div.className = 'response q' + questionId;

    const btnsDiv = document.createElement('div');
    btnsDiv.className = 'btns';
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn rating';
        btn.append(document.createTextNode(`${i}`));
        btnsDiv.appendChild(btn);
    }
    div.append(btnsDiv);
    const textArea = document.createElement('textarea');
    textArea.className = 'additional-detail';
    textArea.placeholder = "(Optional) Feel free to add more detail here!";
    div.append(textArea);
    const submitBtn = document.createElement('button');
    submitBtn.className = 'submit-btn';
    submitBtn.append(document.createTextNode('SUBMIT'));
    div.append(submitBtn);
    return div;
}

function askQuestion(questionId) {
    const questionDiv = createQuestion(questionId);
    chatBox.appendChild(questionDiv);
    
    typeText(QUESTIONS[questionId], questionDiv, () => {
        const responseDiv = createResponseTemplate(questionId);
        chatBox.appendChild(responseDiv);
    });
}

function welcomeMsg() {
    const div = document.createElement('div');
    div.className = 'welcome-msg';
    chatBox.append(div);
    const welcomeText = `Welcome to BrightMind 🌟 Your journey to better mental health starts here!
        Please answer the following questions using the buttons (1 - 5), where
        1 represents "Never" and 5 is "Always"! You are encouraged to add more
        detail, but it's completely optional.`;
    
    typeText(welcomeText, div, () => {
        setTimeout(() => {
            askQuestion(1);
        }, 1000);
    });
}

function startChat() {
    setTimeout(() => {
        welcomeMsg();
    }, 1000);
}
startChat();

// Handle user's submission to each question
let i = 1;
chatBox.addEventListener('click', (e) => {
    if (e.target.classList.contains('rating')) {
        e.target.classList.add('checked');
        for (let [category, response] of Object.entries(ANSWERS)) {
            if (response === '') {
                ANSWERS[category] = e.target.textContent;
                break;
            }
        }

        const btns = e.target.parentElement.children;
        for (let btn of btns) {
            if (!btn.classList.contains('checked')) {
                btn.disabled = true;
            }
        }

    } else if (e.target.classList.contains('submit-btn')) {
        const responseDiv = e.target.closest('.response');
        const rating = responseDiv.querySelector('.btn.rating.checked').textContent;
        const text = responseDiv.querySelector('.additional-detail').value;
        
        // Remove all response elements
        responseDiv.innerHTML = '';

        // Create and append the paragraph with rating and textarea value
        const resultParagraph = document.createElement('p');
        resultParagraph.textContent = `${rating}! ${text}`;
        responseDiv.appendChild(resultParagraph);

        // Ask next question after a short delay
        if (i < QUESTIONS.length - 1) {
            i += 1;
            setTimeout(() => {
                askQuestion(i);
            }, 1000); // Delay before asking the next question
        }
    }
});