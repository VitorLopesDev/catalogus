const API_URL = 'http://localhost:8080';

let livrosCached = [];
let tituloEditando = null;
let abaAtual = 'biblioteca';

function carregarUsuario() {
    const email    = localStorage.getItem('userEmail');
    const nickname = localStorage.getItem('userNickname');
    if (!email) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('navUserEmail').textContent = nickname;
}

function mudarAba(aba) {
    abaAtual = aba;

    document.getElementById('tabBiblioteca').classList.toggle('active', aba === 'biblioteca');
    document.getElementById('tabFavoritos').classList.toggle('active',  aba === 'favoritos');

    limparBusca();
    renderizarAbaAtual();
}

function renderizarAbaAtual() {
    if (abaAtual === 'biblioteca') {
        renderizarCards(livrosCached);
    } else {
        const favoritos = livrosCached.filter(l => l.favorite);
        renderizarCards(favoritos, true);
    }
}

async function toggleFavorito(titulo, event) {
    event.stopPropagation();

    const email = localStorage.getItem('userEmail');

    try {
        const response = await fetch(
            `${API_URL}/book/${encodeURIComponent(titulo)}/favorite?email=${encodeURIComponent(email)}`,
            { method: 'PATCH' }
        );

        if (response.ok) {
            const atualizado = await response.json();
            // Atualiza cache local sem precisar recarregar tudo
            const idx = livrosCached.findIndex(l => l.title === titulo);
            if (idx !== -1) livrosCached[idx].favorite = atualizado.favorite;
            renderizarAbaAtual();
        } else {
            mostrarMensagem('Erro ao atualizar favorito.', 'error');
        }
    } catch (error) {
        console.error('Erro ao favoritar:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

function fecharModalDetalhes(event) {
    if (!event || event.target.id === 'modalDetalhesOverlay') {
        document.getElementById('modalDetalhesOverlay').classList.remove('aberto');
    }
}

async function abrirModalDetalhes(livro) {
    document.getElementById('detalhesTitulo').textContent    = livro.title;
    document.getElementById('detalhesAutor').textContent     = livro.author;
    document.getElementById('detalhesIsbn').textContent      = livro.isbn || 'Não informado';
    document.getElementById('detalhesAno').textContent       = livro.publishYear || 'Não informado';
    document.getElementById('detalhesEditora').textContent   = livro.publisher || 'Não informado';
    document.getElementById('detalhesPaginas').textContent   = livro.pages || 'Não informado';
    document.getElementById('detalhesStatus').textContent    = livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido';
    document.getElementById('detalhesRating').textContent    = livro.rating ? exibirEstrelas(livro.rating) : 'Sem avaliação';
    document.getElementById('detalhesDescricao').textContent = livro.description || 'Nenhum comentário';
    document.getElementById('detalhesCapa').src              = livro.coverUrl || '';
    document.getElementById('modalDetalhesOverlay').classList.add('aberto');
}

function logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNickname');
    window.location.href = 'index.html';
}

async function carregarLivros() {
    const grid       = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = `
        <div class="loading-state">
            <span class="loading-quill">✒</span>
            <p>Consultando o acervo...</p>
        </div>`;
    emptyState.style.display = 'none';

    try {
        const email = localStorage.getItem('userEmail');
        const response = await fetch(`${API_URL}/book/list?email=${encodeURIComponent(email)}`);

        if (response.status === 204) {
            livrosCached = [];
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            atualizarEstatisticas([]);
            atualizarContador(0, 0);
            return;
        }

        const livros = await response.json();
        livrosCached = livros;
        atualizarEstatisticas(livros);

        if (livros.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            atualizarContador(0, 0);
            return;
        }

        renderizarAbaAtual();

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        grid.innerHTML = `
            <div class="loading-state">
                <p>Erro ao carregar o acervo. Verifique o servidor.</p>
            </div>`;
    }
}

function renderizarCards(livros, isFavoritos = false) {
    const grid          = document.getElementById('booksGrid');
    const emptyState    = document.getElementById('emptyState');
    const emptyFav      = document.getElementById('emptyFavoritos');
    const semResult     = document.getElementById('semResultados');

    grid.innerHTML = '';
    emptyState.style.display  = 'none';
    emptyFav.style.display    = 'none';
    semResult.style.display   = 'none';

    if (livros.length === 0) {
        if (isFavoritos) {
            emptyFav.style.display = 'block';
        } else {
            emptyState.style.display = 'block';
        }
        atualizarContador(0, livrosCached.length);
        return;
    }

    livros.forEach((livro, index) => {
        const card = criarCard(livro, index);
        grid.appendChild(card);
    });

    atualizarContador(livros.length, livrosCached.length);
}

function formatarData(dataISO) {
    if (!dataISO) return null;
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function criarCard(livro, index = 0) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.animationDelay = `${index * 80}ms`;

    const dataLeitura = livro.status === 'LIDO' && livro.readDate
        ? `<p class="book-meta"><strong>Lido em: </strong><span>${formatarData(livro.readDate)}</span></p>`
        : '';

    const estrelaCls = livro.favorite ? 'btn-favorito ativo' : 'btn-favorito';
    const estrelaLabel = livro.favorite ? '⭐' : '☆';

    card.innerHTML = `
    <div class="book-spine"></div>
    <div class="book-content">
        <div class="book-info">
            <div class="book-top-row">
                <span class="book-status status-${livro.status || 'NAO_LIDO'}">
                    ${livro.status === 'LIDO' ? '✓ Lido' : livro.status === 'LENDO' ? '📖 Lendo' : '○ Não lido'}
                </span>
                <button class="${estrelaCls}" title="${livro.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${estrelaLabel}</button>
            </div>
            <h3 class="book-title"></h3>
            <p class="book-meta"><strong>Autor: </strong><span class="js-autor"></span></p>
            <p class="book-meta"><strong>ISBN: </strong><span class="js-isbn"></span></p>
            <span class="book-rating">${exibirEstrelas(livro.rating)}</span>
            ${dataLeitura}
            <div class="book-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calcularProgresso(livro.currentPage, livro.pages)}%"></div>
                </div>
                <span class="progress-label">${calcularProgresso(livro.currentPage, livro.pages)}%</span>
            </div>
            <p class="book-description"></p>
            <div class="book-actions">
                <button class="btn-editar">✏ Editar</button>
                <button class="btn-deletar">✕ Remover</button>
            </div>
        </div>
        <div class="book-cover">
            <img
                src="https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg"
                alt="Capa de ${livro.title}"
                onerror="this.style.display='none'"
            >
        </div>
    </div>`;

    card.querySelector('.book-title').textContent       = livro.title;
    card.querySelector('.js-autor').textContent         = livro.author;
    card.querySelector('.js-isbn').textContent          = livro.isbn || 'Não informado';
    card.querySelector('.book-description').textContent = livro.description || '';

    card.querySelector('.btn-favorito').addEventListener('click', (e) => toggleFavorito(livro.title, e));
    card.querySelector('.btn-editar').addEventListener('click',   () => abrirModalEdicao(livro));
    card.querySelector('.btn-deletar').addEventListener('click',  () => deletarLivro(livro.title));
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-editar') && !e.target.closest('.btn-deletar') && !e.target.closest('.btn-favorito')) {
            abrirModalDetalhes(livro);
        }
    });

    return card;
}

function atualizarCampoPagina() {
    const status      = document.getElementById('campoStatus').value;
    const grupoPagina = document.getElementById('grupoPaginaAtual');
    const grupoData   = document.getElementById('grupoDataLeitura');

    grupoPagina.style.display = status === 'LENDO' ? 'block' : 'none';
    grupoData.style.display   = status === 'LIDO'  ? 'block' : 'none';
}

function exibirEstrelas(rating) {
    if (!rating) return '';
    rating = parseFloat(rating);
    const cheias = Math.floor(rating);
    const meia   = rating % 1 >= 0.5 ? '⯪' : '';
    return '★'.repeat(cheias) + meia;
}

function atualizarEstatisticas(livros) {
    const total         = livros.length;
    const autoresUnicos = new Set(livros.map(l => l.author.trim())).size;
    const comIsbn       = livros.filter(l => l.isbn && l.isbn.trim() !== '').length;

    animarNumero('statTotal',   total);
    animarNumero('statAutores', autoresUnicos);
    animarNumero('statIsbn',    comIsbn);
}

function animarNumero(elementId, valorFinal) {
    const el         = document.getElementById(elementId);
    const duracao    = 600;
    const intervalo  = 16;
    const passos     = duracao / intervalo;
    const incremento = valorFinal / passos;

    let atual = 0;
    const timer = setInterval(() => {
        atual += incremento;
        if (atual >= valorFinal) {
            atual = valorFinal;
            clearInterval(timer);
        }
        el.textContent = Math.floor(atual);
    }, intervalo);
}

function filtrarLivros(termo) {
    const grid      = document.getElementById('booksGrid');
    const semResult = document.getElementById('semResultados');
    const btnLimpar = document.getElementById('btnLimparBusca');

    btnLimpar.style.display = termo.length > 0 ? 'flex' : 'none';

    const termoNorm = termo.toLowerCase().trim();
    const base      = abaAtual === 'favoritos' ? livrosCached.filter(l => l.favorite) : livrosCached;

    if (!termoNorm) {
        semResult.style.display = 'none';
        renderizarCards(base, abaAtual === 'favoritos');
        return;
    }

    const resultado = base.filter(livro =>
        livro.title.toLowerCase().includes(termoNorm) ||
        livro.author.toLowerCase().includes(termoNorm)
    );

    if (resultado.length === 0) {
        grid.innerHTML = '';
        semResult.style.display = 'block';
        atualizarContador(0, livrosCached.length);
        return;
    }

    semResult.style.display = 'none';
    renderizarCards(resultado, abaAtual === 'favoritos');
}

function limparBusca() {
    const campo = document.getElementById('campoBusca');
    campo.value = '';
    document.getElementById('btnLimparBusca').style.display = 'none';
    document.getElementById('semResultados').style.display  = 'none';
}

function atualizarContador(visiveis, total) {
    const el = document.getElementById('bookCount');
    if (visiveis === total) {
        el.textContent = total === 1 ? '1 obra' : `${total} obras`;
    } else {
        el.textContent = `${visiveis} de ${total} obras`;
    }
}

async function buscarPorIsbn() {
    const isbn = document.getElementById('campoIsbn').value.trim();

    if (!isbn) {
        mostrarMensagem('Digite um ISBN para buscar.', 'error');
        return;
    }

    mostrarMensagem('Buscando livro...', 'info');

    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const data = await response.json();
        const info = data[`ISBN:${isbn}`];

        if (!info) {
            mostrarMensagem('ISBN não encontrado na base de dados.', 'error');
            return;
        }

        document.getElementById('campoTitulo').value = info.title || '';
        document.getElementById('campoAutor').value  = info.authors?.[0]?.name || '';
        document.getElementById('dadosLivro').style.display = 'block';
        mostrarMensagem('Livro encontrado!', 'success');

    } catch (error) {
        console.error('Erro ao buscar ISBN:', error);
        mostrarMensagem('Erro ao conectar com a base de dados.', 'error');
    }
}

function abrirModal() {
    tituloEditando = null;
    document.getElementById('modalTitulo').textContent    = 'Nova Obra';
    document.getElementById('btnSalvarTexto').textContent = 'Registrar Obra';
    document.getElementById('livroForm').reset();
    document.getElementById('dadosLivro').style.display = 'none';
    document.getElementById('campoReadDate').max = new Date().toISOString().split('T')[0];
    document.getElementById('modalOverlay').classList.add('aberto');
    atualizarCampoPagina();
}

function calcularProgresso(currentPage, totalPages) {
    if (!currentPage || !totalPages) return 0;
    return Math.min(Math.round((currentPage / totalPages) * 100), 100);
}

function abrirModalEdicao(livro) {
    tituloEditando = livro.title;
    document.getElementById('modalTitulo').textContent    = 'Editar Obra';
    document.getElementById('btnSalvarTexto').textContent = 'Salvar Alterações';
    document.getElementById('campoIsbn').value            = livro.isbn || '';
    document.getElementById('campoTitulo').value          = livro.title;
    document.getElementById('campoAutor').value           = livro.author;
    document.getElementById('campoDescricao').value       = livro.description || '';
    document.getElementById('campoStatus').value          = livro.status || 'NAO_LIDO';
    document.getElementById('campoRating').value          = livro.rating || '';
    document.getElementById('campoCurrentPage').value     = livro.currentPage || '';
    document.getElementById('campoReadDate').value        = livro.readDate || '';
    document.getElementById('campoReadDate').max          = new Date().toISOString().split('T')[0];
    document.getElementById('dadosLivro').style.display  = 'block';
    document.getElementById('modalOverlay').classList.add('aberto');
    atualizarCampoPagina();
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('aberto');
    tituloEditando = null;
}

function fecharModalFora(event) {
    if (event.target.id === 'modalOverlay') fecharModal();
}

async function salvarLivro() {
    const titulo      = document.getElementById('campoTitulo').value.trim();
    const autor       = document.getElementById('campoAutor').value.trim();
    const status      = document.getElementById('campoStatus').value.trim();
    const isbn        = document.getElementById('campoIsbn').value.trim();
    const rating      = document.getElementById('campoRating').value.trim();
    const currentPage = document.getElementById('campoCurrentPage').value.trim();
    const description = document.getElementById('campoDescricao').value.trim();
    const readDate    = document.getElementById('campoReadDate').value || null;
    const email       = localStorage.getItem('userEmail');

    if (!titulo || !autor) {
        mostrarMensagem('Título e autor são obrigatórios.', 'error');
        return;
    }

    const payload = { title: titulo, author: autor, isbn, ownerEmail: email, status, rating, currentPage, description, readDate };

    try {
        let response;

        if (tituloEditando) {
            response = await fetch(
                `${API_URL}/book/${encodeURIComponent(tituloEditando)}`,
                { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );
        } else {
            response = await fetch(`${API_URL}/book`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            mostrarMensagem(tituloEditando ? 'Obra atualizada!' : 'Obra adicionada ao acervo!', 'success');
            fecharModal();
            limparBusca();
            await carregarLivros();
        } else {
            const data = await response.json().catch(() => ({}));
            mostrarMensagem(data.message || 'Erro ao salvar.', 'error');
        }

    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

async function deletarLivro(titulo) {
    if (!confirm(`Deseja remover "${titulo}" do acervo?`)) return;

    const email = localStorage.getItem('userEmail');

    try {
        const response = await fetch(
            `${API_URL}/book/${encodeURIComponent(titulo)}?email=${encodeURIComponent(email)}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            mostrarMensagem('Obra removida do acervo.', 'success');
            await carregarLivros();
        } else {
            mostrarMensagem('Erro ao remover a obra.', 'error');
        }

    } catch (error) {
        console.error('Erro ao deletar:', error);
        mostrarMensagem('Não foi possível conectar ao servidor.', 'error');
    }
}

function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('message');
    el.textContent = texto;
    el.className = `message ${tipo}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}

window.addEventListener('load', () => {
    carregarUsuario();
    carregarLivros();
});