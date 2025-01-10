const users = [{ username: 'admin', password: 'admin', isAdmin: true }];
let currentUser = null;
const votes = [];

function renderVotes() {
    const votesList = document.getElementById('votes-list');
    votesList.innerHTML = '';
    votes.forEach((vote, index) => {
        const voteDiv = document.createElement('div');
        voteDiv.className = 'vote';

        const totalVotes = vote.choices.reduce((sum, choice) => sum + (choice.count || 0), 0);

        const voteChoices = vote.choices.map((choice, choiceIndex) => {
            const percentage = totalVotes > 0 ? ((choice.count || 0) / totalVotes * 100).toFixed(1) : 0;
            return `
                <div class="choice">
                    <input type="radio" name="vote-${index}" id="choice-${index}-${choiceIndex}" value="${choiceIndex}">
                    <label for="choice-${index}-${choiceIndex}">
                        ${choice.text} (${choice.count || 0} votes, ${percentage}%)
                    </label>
                    <div class="progress-bar" style="width: ${percentage}%;"></div>
                </div>`;
        }).join('');

        voteDiv.innerHTML = `
            <strong>${vote.title}</strong><br>
            ${voteChoices}
        `;

        if (currentUser && !currentUser.isAdmin) {
            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Vote';
            submitBtn.onclick = () => {
                const selected = document.querySelector(`input[name="vote-${index}"]:checked`);
                if (selected) {
                    const choiceIndex = parseInt(selected.value, 10);
                    vote.choices[choiceIndex].count = (vote.choices[choiceIndex].count || 0) + 1;
                    renderVotes();
                } else {
                    alert('Please select an option to vote.');
                }
            };
            voteDiv.appendChild(submitBtn);
        } else if (currentUser && currentUser.isAdmin) {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => {
                votes.splice(index, 1);
                renderVotes();
            };
            voteDiv.appendChild(deleteBtn);
        }

        votesList.appendChild(voteDiv);
    });
}

function showMessage(message) {
    document.getElementById('auth-message').textContent = message;
}

document.getElementById('register-btn').onclick = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.length < 4 || password.length < 4) {
        showMessage('Username and password must be 4 or more characters.');
        return;
    }

    if (users.find(user => user.username === username)) {
        showMessage('Username already exists.');
        return;
    }

    users.push({ username, password, isAdmin: false });
    showMessage('Registration successful!');
};

document.getElementById('login-btn').onclick = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        showMessage('Invalid username or password.');
        return;
    }

    currentUser = user;
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.username;

    if (currentUser.isAdmin) {
        document.getElementById('admin-tools').style.display = 'block';
    } else {
        document.getElementById('admin-tools').style.display = 'none';
    }

    renderVotes();
};

document.getElementById('logout-btn').onclick = () => {
    currentUser = null;
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
    document.getElementById('admin-tools').style.display = 'none';
    showMessage('');
};

document.getElementById('add-vote-btn').onclick = () => {
    const newVoteTitle = document.getElementById('new-vote').value;
    const choices = [];

    for (let i = 0; i < 5; i++) {
        const choiceInput = document.getElementById(`choice-${i}`);
        if (choiceInput && choiceInput.value.trim()) {
            choices.push({ text: choiceInput.value.trim(), count: 0 });
        }
    }

    if (newVoteTitle.trim() && choices.length > 0) {
        votes.push({ title: newVoteTitle, choices });
        document.getElementById('new-vote').value = '';
        for (let i = 0; i < 5; i++) {
            const choiceInput = document.getElementById(`choice-${i}`);
            if (choiceInput) choiceInput.value = '';
        }
        renderVotes();
    } else {
        alert('Vote title and at least one choice are required.');
    }
};
