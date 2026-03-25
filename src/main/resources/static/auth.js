const API_URL = 'http://localhost:8080';

function showTab(tabName, btnClicado) {
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabName + 'Panel').classList.add('active');
    btnClicado.classList.add('active');

    esconderMensagem();
}


function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('message');
    el.textContent = texto;
    el.className = `message ${tipo}`;
    el.style.display = 'block';

    setTimeout(esconderMensagem, 4000);
}

function esconderMensagem() {
    const el = document.getElementById('message');
    el.style.display = 'none';
    el.className = 'message';
}

document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
                mostrarMensagem('E-mail inválido. Use o formato: nome@dominio.com', 'error');
                return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userNickname', data.nickname);
            mostrarMensagem('Acervo aberto com sucesso!', 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            mostrarMensagem(data.message || 'Credenciais inválidas.', 'error');
        }

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
});

document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nickname = document.getElementById('registerNickname').value.trim();
    if (nickname.length < 2){
            mostrarMensagem('O nome deve ter pelo menos 2 caracteres.')
            return;
    }
    const email           = document.getElementById('registerEmail').value.trim();
    const password        = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;
    const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
            mostrarMensagem('E-mail inválido. Use o formato: nome@dominio.com', 'error');
            return;
    }

    if (password !== confirmPassword) {
        mostrarMensagem('As senhas não coincidem.', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarMensagem('A senha deve ter ao menos 6 caracteres.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickName: nickname, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userNickname', data.nickname);
            mostrarMensagem('Conta criada! Faça login para continuar.', 'success');
            document.getElementById('registerFormElement').reset();

            setTimeout(() => {
                showTab('login', document.querySelector('.tab-btn'));
            }, 2000);
        } else {
            mostrarMensagem(data.message || 'Erro ao criar conta.', 'error');
        }

    } catch (error) {
        console.error('Erro ao registrar:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
});

window.addEventListener('load', () => {
    if (localStorage.getItem('userEmail')) {
        window.location.href = 'dashboard.html';
    }
});