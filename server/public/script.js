const dbName = "user_date_db";
const dbVersion = 2;

// Function to open or create the IndexedDB database
function openOrCreateDB() {
  return new Promise((resolve, reject) => {
    // Check if the database already exists
    indexedDB.databases().then(dbs => {
      const dbExists = dbs.some(db => db.name === dbName);

      if (!dbExists) {
        // Database does not exist, create it
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          const objectStore = db.createObjectStore("user", { keyPath: "date" });
        };

        request.onerror = (event) => {
          console.error('Error opening database:', event.target.error);
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          console.log('Database opened successfully:', db);
          resolve(db);
        };
      } else {
        // Database already exists, open it
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
          console.error('Error opening database:', event.target.error);
          reject(event.target.error);
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          console.log('Database opened successfully:', db);
          resolve(db);
        };
      }
    }).catch(error => {
      console.error('Error checking if database exists:', error);
      reject(error);
    });
  });
}

// Function to add a new date to the database
function addNewDate(db, dateToAdd) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["user"], "readwrite");
    const objectStore = transaction.objectStore("user");

    // Check if the date already exists in the database
    const getRequest = objectStore.get(dateToAdd);

    getRequest.onsuccess = (event) => {
      const existingRecord = event.target.result;

      if (!existingRecord) {
        // Date does not exist in the database, add it
        const addRequest = objectStore.add({ date: dateToAdd });

        addRequest.onsuccess = (event) => {
          console.log('New date added successfully:', dateToAdd);
          resolve();
        };

        addRequest.onerror = (event) => {
          console.error('Error adding date:', event.target.error);
          reject(event.target.error);
        };
      } else {
        // Date already exists in the database
        console.log('Date already exists in the database:', dateToAdd);
        resolve();
      }
    };

    getRequest.onerror = (event) => {
      console.error('Error checking date in database:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Usage example: open or create the database and add a new date
openOrCreateDB().then(db => {
  // Add a new date (current date) to the database
  const currentDate = new Date();
  return addNewDate(db, currentDate);
}).catch(error => {
  console.error('Error opening or creating database:', error);
});



const QUESTIONS = [
    '',
    'Has your sleep been disturbed recently?',
    'What would you rate your recent fatigue levels?',
    'Do you tend to feel like you are worthless?',
    'Have you noticed an increase in aggression?',
    'Any drastic changes in appetite?',
    'Do you suffer from panic attacks, if so how frequently?',
];
const ANSWERS = {
    "Sleep_PCA": '',
    "Fatigue_PCA": '',
    "Worthlessness_PCA": '',
    "Aggression_PCA": '',
    "Appetite": '',
    "Panic Attacks": '',
};
const chatBox = document.querySelector('.chat');
chatBox.innerHTML = ''; // Delete static HTML layout

function typeText(text, container, callback) {
    let charIndex = 0;
    function typeNextChar() {
        if (charIndex < text.length) {
            container.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeNextChar, 5); // Adjust typing speed here
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
    for (let i = 1; i <= 4; i++) {
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
    const welcomeText = `Welcome to Palchecker 🌟 Your journey to better mental health starts here!
        Please answer the following questions using the buttons (1 - 5), where
        1 represents "Never" and 5 is "Always"! You are encouraged to add more
        detail, but it's completely optional.`;

    typeText(welcomeText, div, () => {
        setTimeout(() => {
            askQuestion(1);
        }, 1000);
    });
}

function analyticsMsg () {
    const div = document.createElement('div');
    div.className = 'analytics-msg';
    chatBox.append(div);
    const analyticsText = `Thank you for using Palchecker! You will be forwarded to the
        analytics page now.`;

    typeText(analyticsText, div, () => {
        setTimeout(() => {
            // Remove chat
            chatBox.remove();

            // Request data from server
            const URL = "http://palchecker.xyz:3000/"
            sendAndRequestData(URL);
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
        else {
            analyticsMsg();
        }
    }
});

function loadAnalytics(score) {
    // Unhide analytics
    const analytics = document.querySelector('.analytics');
    loadScore(score);
    loadCalendar();
    loadEmoji(score);
    fetchQuote();
    analytics.hidden = false;
}

function loadEmoji(score){
    const emoji = document.querySelector('.emoji')
    let emojiSrc;
    if (score <= 50) {
        emojiSrc = 'smiley-images/img_2.png';
    } else if (score <= 60) {
        emojiSrc = 'smiley-images/img_1.png';
    } else {
        emojiSrc = 'smiley-images/img.png';
    }

    emoji.src = emojiSrc;
}

function loadScore(score) {
    const scoreDiv = document.querySelector('.score');
    scoreDiv.textContent = `Score: ${score}%`
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event);
        };
    });
}

// Function to get all stored dates from IndexedDB
function getStoredDates(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["user"], "readonly");
        const objectStore = transaction.objectStore("user");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const storedDates = event.target.result.map(entry => new Date(entry.date).toDateString());
            resolve(storedDates);
        };

        request.onerror = (event) => {
            console.error("Error fetching stored dates:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Function to load the calendar
async function loadCalendar() {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const monthHeader = document.querySelector('.month-header');
    monthHeader.textContent = `${currentMonth} ${currentYear}`;

    const daysContainer = document.querySelector('.days');
    daysContainer.innerHTML = '';

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDay = document.createElement('div');
      daysContainer.appendChild(emptyDay);
    }

    const db = await openDatabase();
    const storedDates = await getStoredDates(db);

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();
        day.textContent = i;

        if (storedDates.includes(date)) {
            day.classList.add('green');
        }

        daysContainer.appendChild(day);
    }
}

function sendAndRequestData(url) {
    fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ANSWERS)
      })
      .then(response => response.json())
      .then(data => loadAnalytics(data.score))
      .catch(error => console.error('Error:', error));
}

async function fetchQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random?tags=motivational');
        const data = await response.json();
        document.getElementById('quote-text').textContent = data.content;
        document.getElementById('quote-author').textContent = `- ${data.author}`;
    } catch (error) {
        document.getElementById('quote-text').textContent = 'An error occurred while fetching the quote.';
        document.getElementById('quote-author').textContent = 'PalChecker Team';
    }
}
