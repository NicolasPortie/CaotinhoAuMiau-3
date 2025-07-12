toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};



let slideAtual = 0;
let intervaloCarrossel = null;


let usuarioEstaLogado = false;
let usuarioIdAtual = '';
let usuarioNomeAtual = '';
let usuarioTipoAtual = '';

function initExplorarPets() {
    console.log("Página carregada, inicializando componentes...");
    
    // Inicializa o cálculo de itens por página primeiro
    inicializarItensPorPagina();
    
    // Forçar o limite de itens por página
    forcarLimiteItensPorPagina();
    
    // Garantir que a paginação funcione corretamente
    garantirFuncionamentoPaginacao();
    
    // Inicializar a paginação com eventos diretos
    inicializarPaginacao();
    
    // Garantir que os cards sejam exibidos corretamente
    function garantirCarregamentoDosCards() {
        console.log("Verificando carregamento dos cards...");
        
        const cards = document.querySelectorAll('.pet-card');
        const grid = document.querySelector('.pets-grid');
        
        if (cards.length === 0 && grid) {
            console.log("Nenhum card encontrado, tentando recarregar...");
            
            const formFiltros = document.getElementById('formFiltros');
            
            if (formFiltros) {
                try {
                    formFiltros.submit();
                } catch (e) {
                    console.error("Erro ao enviar formulário:", e);
                    window.location.reload();
                }
            } else {
                window.location.href = "/usuario/pets/explorar";
            }
        } else {
            console.log(`${cards.length} cards encontrados, ajustando visibilidade...`);
            
            cards.forEach(card => {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.visibility = 'visible';
            });
            
            if (grid) {
                grid.style.display = 'grid'; 
            }
        }
    }
    
    
    const referrer = document.referrer;
    if (referrer && (referrer.includes('/usuario/adocao/formulario/') || referrer.includes('/adocao/formulario/'))) {
        
        setTimeout(garantirCarregamentoDosCards, 500);
    }
    
    
    if (window.temMensagensTempData) {
        if (window.mensagemErro) {
            exibirAlerta('erro', window.mensagemErro);
        }
        
        if (window.mensagemSucesso) {
            exibirAlerta('sucesso', window.mensagemSucesso);
        }
    }
    
    
    const dadosUsuario = document.getElementById('dados-usuario');
    if (dadosUsuario) {
        usuarioEstaLogado = dadosUsuario.dataset.usuarioLogado === 'true';
        usuarioIdAtual = dadosUsuario.dataset.usuarioId || '';
        usuarioNomeAtual = dadosUsuario.dataset.usuarioNome || '';
        usuarioTipoAtual = dadosUsuario.dataset.usuarioTipo || '';
        
            logado: usuarioEstaLogado,
            id: usuarioIdAtual,
            nome: usuarioNomeAtual,
            tipo: usuarioTipoAtual
        });
    }
    
    const carrosselElement = document.getElementById('carouselPets');
    if (carrosselElement) {
        try {
            
            
            if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                var carouselInstance = new bootstrap.Carousel(carrosselElement, {
                    interval: 5000,
                    pause: false,
                    wrap: true
                });
                
                
                
                gerenciarBarrasDeProgresso();
                
                
                carrosselElement.addEventListener('slid.bs.carousel', function() {
                    gerenciarBarrasDeProgresso();
                });
            } else {
                
                iniciarCarrosselAutomatico();
                
                
                const slides = carrosselElement.querySelectorAll('.carousel-item');
                slides.forEach((slide, index) => {
                    slide.style.display = index === 0 ? 'block' : 'none';
                });
                
                
                mudarSlide(0);
            }
        } catch (error) {
            console.error("Erro ao inicializar carrossel:", error);
            
            iniciarCarrosselAutomatico();
        }
    }
    
    
    document.addEventListener('click', fecharSobreposicoesAoClicarFora);
    
    
    document.addEventListener('keydown', fecharModaisComEsc);
    
    
    verificarMensagensURL();
    
    
    filtrarPets();
    
    
    configurarMenuENotificacoes();
    
    
    inicializarFiltros();
    inicializarAnimacoesCards();
    
    
    verificarLayoutEAjustar();
    ajustarLarguraCards();
    
    // Adicionar um listener para redimensionamento da janela
    window.addEventListener('resize', ajustarLarguraCards);

    
    document.querySelectorAll('.botao-adotar, .adopt-button').forEach(botao => {
        botao.addEventListener('click', function(e) {
            if (!usuarioEstaLogado) {
                e.preventDefault();
                const petCard = this.closest('.cartao-pet, .pet-card');
                if (petCard) {
                    const petId = petCard.dataset.id || '';
                    abrirModal('modalLoginCadastro');
                    document.getElementById('petIdAutenticacao').value = petId;
                }
            }
        });
    });

    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Garantir que o seletor de itens por página tenha o evento de mudança registrado
    const seletor = document.getElementById('selectItensPorPagina');
    if (seletor) {
        // Remover qualquer evento existente para evitar duplicação
        seletor.removeEventListener('change', handleItensPorPaginaChange);
        
        // Adicionar o novo evento
        seletor.addEventListener('change', handleItensPorPaginaChange);
    }
    
    console.log("Evento de mudança do seletor de itens por página registrado");
}

if (document.readyState !== 'loading') {
    initExplorarPets();
} else {
    document.addEventListener('DOMContentLoaded', initExplorarPets);
}

// Função para lidar com a mudança no seletor de itens por página
function handleItensPorPaginaChange() {
    const valorSelecionado = parseInt(this.value, 10);
    
    if (isNaN(valorSelecionado)) {
        console.error("Valor inválido no seletor de itens por página:", this.value);
        return;
    }
    
    console.log("Valor selecionado para itens por página:", valorSelecionado);
    
    // Atualizar os campos ocultos
    document.getElementById('itensPorPagina').value = valorSelecionado;
    document.getElementById('itensPorPaginaNav').value = valorSelecionado;
    document.getElementById('paginaAtual').value = 1; // Volta para a primeira página
        
        // Submeter o formulário
        document.getElementById('formNavegacao').submit();
}

function configurarMenuENotificacoes() {
    
    
    const btnMenuHamburguer = document.getElementById('btnMenuHamburguer');
    if (btnMenuHamburguer) {
        
        const novoBotao = btnMenuHamburguer.cloneNode(true);
        btnMenuHamburguer.parentNode.replaceChild(novoBotao, btnMenuHamburguer);
        
        
        novoBotao.addEventListener('click', function(e) {
            e.preventDefault();
            
            
            if (typeof window.alternarMenu === 'function') {
                window.alternarMenu();
            } else {
                
                const menuLateral = document.querySelector('.menu-lateral');
                const menuSobreposicao = document.querySelector('.menu-sobreposicao');
                
                if (menuLateral && menuSobreposicao) {
                    const estaAtivo = menuLateral.classList.contains('ativo');
                    
                    if (estaAtivo) {
                        menuLateral.classList.remove('ativo');
                        menuSobreposicao.classList.remove('ativo');
                        this.classList.remove('ativo');
                    } else {
                        menuLateral.classList.add('ativo');
                        menuSobreposicao.classList.add('ativo');
                        this.classList.add('ativo');
                    }
                    
                }
            }
        });
    }
    
    
    const menuSobreposicao = document.querySelector('.menu-sobreposicao');
    if (menuSobreposicao) {
        menuSobreposicao.addEventListener('click', function() {
            if (typeof window.fecharMenuLateral === 'function') {
                window.fecharMenuLateral();
            } else {
                
                const menuLateral = document.querySelector('.menu-lateral');
                const btnHamburguer = document.getElementById('btnMenuHamburguer');
                
                if (menuLateral) menuLateral.classList.remove('ativo');
                if (btnHamburguer) btnHamburguer.classList.remove('ativo');
                this.classList.remove('ativo');
            }
        });
    }
    
    
    const iconeNotificacao = document.getElementById('notificacaoIcone');
    if (iconeNotificacao) {
        
        const novoIcone = iconeNotificacao.cloneNode(true);
        iconeNotificacao.parentNode.replaceChild(novoIcone, iconeNotificacao);
        
        
        novoIcone.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            
            if (typeof window.togglePainelNotificacoes === 'function') {
                window.togglePainelNotificacoes();
            } else {
            }
        });
    }
}

function inicializarFiltros() {
    const botaoLimpar = document.querySelector('#btnLimparFiltros, .botao-limpar, .clear-button');
    if (botaoLimpar) {
        botaoLimpar.addEventListener('click', function(e) {
            e.preventDefault();
            limparFiltros();
        });
    }
    
    
    document.getElementById('filtroNome')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('formFiltros')?.submit();
        }
    });
}







function filtrarPets() {
    
    const form = document.getElementById('formFiltros');
    if (!form) {
        console.error("Formulário de filtros não encontrado");
        return;
    }
    
    
    document.querySelector('.botao-filtrar')?.addEventListener('click', function(e) {
        e.preventDefault();
        form.submit();
    });
    
    
    const todosPets = document.querySelectorAll('.cartao-pet');
    const mensagemSemPets = document.querySelector('.mensagem-sem-pets');
    
    if (todosPets.length === 0 && mensagemSemPets) {
        mensagemSemPets.style.display = 'flex';
    } else if (mensagemSemPets) {
        mensagemSemPets.style.display = 'none';
    }
}


function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-aberto');
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-aberto');
    }
}

function gerarNotificacoesExemplo() {
    const notificacoes = [
        {
            icone: 'fa-heart',
            titulo: 'Adoção em processo',
            mensagem: 'Sua solicitação de adoção foi recebida e está em análise.',
            data: '2 horas atrás',
            lida: false
        },
        {
            icone: 'fa-paw',
            titulo: 'Novo pet disponível',
            mensagem: 'Um novo pet foi adicionado que corresponde às suas preferências!',
            data: 'Ontem',
            lida: true
        },
        {
            icone: 'fa-envelope',
            titulo: 'Mensagem recebida',
            mensagem: 'Você recebeu uma mensagem sobre um de seus processos de adoção.',
            data: '3 dias atrás',
            lida: true
        }
    ];
    
    let html = '';
    
    notificacoes.forEach(n => {
        html += `
            <div class="notificacao-item ${!n.lida ? 'notificacao-nao-lida' : ''}">
                <div class="notificacao-icone">
                    <i class="fas ${n.icone}"></i>
                </div>
                <div class="notificacao-conteudo">
                    <div class="notificacao-titulo">${n.titulo}</div>
                    <div class="notificacao-mensagem">${n.mensagem}</div>
                    <div class="notificacao-data">${n.data}</div>
                </div>
            </div>
        `;
    });
    
    return html;
}

function marcarTodasComoLidas() {
    
    const notificacaoItems = document.querySelectorAll('.notificacao-item.notificacao-nao-lida');
    notificacaoItems.forEach(item => {
        item.classList.remove('notificacao-nao-lida');
    });
    
    
    const contador = document.querySelector('.contador-notificacoes');
    if (contador) contador.style.display = 'none';
    
    
    exibirMensagem('Todas as notificações foram marcadas como lidas', 'success');
}

function abrirModalResponsabilidade(petId) {
    if (!usuarioEstaLogado) {
        abrirModal('modalLoginCadastro');
        document.getElementById('petIdAutenticacao').value = petId || '';
        return;
    }
    
    if (usuarioTipoAtual === 'Admin') {
        abrirModal('modalAdminPrincipal');
        return;
    }
    
    
    fetch('/usuario/adocao/verificar-adocoes-pendentes')
        .then(response => response.json())
        .then(data => {
            if (data.temAdocoesPendentes) {
                
                abrirModal('modalAdocaoPendente');
                return;
            }
            
            
            document.getElementById('petIdResponsabilidade').value = petId || '';
            abrirModal('modalResponsabilidade');
        })
        .catch(error => {
            console.error('Erro ao verificar adoções:', error);
            toastr.error('Ocorreu um erro ao verificar suas adoções. Por favor, tente novamente.');
        });
}

function realizarLogout() {
    window.location.href = '/autenticacao/logout';
}

function fecharSobreposicoesAoClicarFora(event) {
    
    const painelNotificacoes = document.getElementById('painel-notificacoes');
    if (painelNotificacoes && painelNotificacoes.classList.contains('ativo')) {
        const iconeNotificacao = document.querySelector('.icone-notificacao');
        if (iconeNotificacao && !iconeNotificacao.contains(event.target) && !painelNotificacoes.contains(event.target)) {
            painelNotificacoes.classList.remove('ativo');
        }
    }
}

function fecharModaisComEsc(event) {
    if (event.key === 'Escape') {
        
        const modais = document.querySelectorAll('.modal');
        modais.forEach(modal => {
            if (modal.style.display === 'flex') {
                const modalId = modal.id;
                fecharModal(modalId);
            }
        });
    }
}

function verificarMensagensURL() {
    const params = new URLSearchParams(window.location.search);
    const mensagem = params.get('mensagem');
    const tipo = params.get('tipo') || 'info';
    
    if (mensagem) {
        exibirMensagem(mensagem, tipo);
        
        
        const url = new URL(window.location.href);
        url.searchParams.delete('mensagem');
        url.searchParams.delete('tipo');
        window.history.replaceState({}, document.title, url.toString());
    }
}

function exibirMensagem(mensagem, tipo) {
    if (typeof toastr !== 'undefined') {
        if (tipo === 'success') {
            toastr.success(mensagem);
        } else if (tipo === 'error') {
            toastr.error(mensagem);
        } else {
            toastr.info(mensagem);
        }
    } else {
        alert(mensagem);
    }
}

function obterIconeParaTipo(tipo) {
    switch (tipo?.toLowerCase()) {
        case 'adocao': return 'fa-heart';
        case 'formulario': return 'fa-file-alt';
        case 'sistema': return 'fa-cog';
        case 'alerta': return 'fa-exclamation-circle';
        default: return 'fa-bell';
    }
}

function formatarData(dataString) {
    if (!dataString) return 'Sem data';
    
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    
    const opcoes = { hour: '2-digit', minute: '2-digit' };
    
    
    if (data.toDateString() === hoje.toDateString()) {
        return `Hoje ${data.toLocaleTimeString([], opcoes)}`;
    }
    
    
    if (data.toDateString() === ontem.toDateString()) {
        return `Ontem ${data.toLocaleTimeString([], opcoes)}`;
    }
    
    
    return data.toLocaleDateString() + ' ' + data.toLocaleTimeString([], opcoes);
}

function limparFiltros() {
    const form = document.getElementById('formFiltros');
    if (form) {
        form.reset();
    }

    window.location.href = '/usuario/pets/explorar';
}

function abrirModalNotificacoes() {
    const iconeNotificacao = document.querySelector('.icone-notificacao');
    
    if (!iconeNotificacao) {
        console.error("Ícone de notificação não encontrado");
        return;
    }
    
    const painelNotificacoes = document.getElementById('painel-notificacoes');
    
    if (!painelNotificacoes) {
        console.error("Painel de notificações não encontrado");
        return;
    }
    
    
    const isAtivo = painelNotificacoes.classList.toggle('ativo');
    
    if (isAtivo) {
        
        const rect = iconeNotificacao.getBoundingClientRect();
        painelNotificacoes.style.top = rect.bottom + 10 + 'px';
        painelNotificacoes.style.right = window.innerWidth - rect.right + 'px';
        
        
        const listaNotificacoes = painelNotificacoes.querySelector('.lista-notificacoes');
        if (listaNotificacoes && listaNotificacoes.children.length === 0) {
            gerarNotificacoesExemplo();
        }
        
        
        document.addEventListener('click', function fecharAoClicarFora(e) {
            if (!painelNotificacoes.contains(e.target) && !iconeNotificacao.contains(e.target)) {
                painelNotificacoes.classList.remove('ativo');
                document.removeEventListener('click', fecharAoClicarFora);
            }
        });
    }
}


function prosseguirAdocao() {
    
    const petId = document.getElementById('petIdResponsabilidade').value;
    
    if (!petId) {
        console.error('ID do pet não encontrado');
        if (typeof toastr !== 'undefined') {
            toastr.error('Houve um erro ao iniciar o processo de adoção. Tente novamente.');
        } else {
            alert('Houve um erro ao iniciar o processo de adoção. Tente novamente.');
        }
        return;
    }
    
    try {
        
        const url = `/usuario/adocao/formulario/${petId}`;
        
        
        if (typeof fecharModal === 'function') {
            fecharModal('modalResponsabilidade');
        }
        
        
        setTimeout(function() {
            
            window.location.href = url;
        }, 100);
    } catch (error) {
        console.error('Erro ao prosseguir com adoção:', error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Ocorreu um erro ao iniciar o processo de adoção. Tente novamente.');
        } else {
            alert('Ocorreu um erro ao iniciar o processo de adoção. Tente novamente.');
        }
    }
}


function redirecionarLogin() {
    const petId = document.getElementById('petIdAutenticacao').value;
    window.location.href = `/autenticacao/login?returnUrl=/usuario/pets/explorar&petId=${petId}`;
}


function redirecionarCadastro() {
    const petId = document.getElementById('petIdAutenticacao').value;
    window.location.href = `/autenticacao/cadastro?returnUrl=/usuario/pets/explorar&petId=${petId}`;
}

function exibirAlerta(tipo, mensagem) {
    if (!mensagem) return;
    
    const classeAlerta = tipo === 'erro' ? 'alert-danger' : 'alert-success';
    const icone = tipo === 'erro' ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-check-circle"></i>';
    
    const alerta = `
        <div class="alert ${classeAlerta} alert-dismissible fade show d-flex align-items-center" role="alert">
            <div class="me-3 fs-4">${icone}</div>
            <div>${mensagem}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
    
    const alertaContainer = document.getElementById('alertaContainer');
    if (alertaContainer) {
        alertaContainer.innerHTML = alerta;
        
        
        setTimeout(() => {
            const alertas = document.querySelectorAll('.alert');
            alertas.forEach(alerta => {
                if (typeof bootstrap !== 'undefined') {
                    const bsAlert = new bootstrap.Alert(alerta);
                    bsAlert.close();
                } else {
                    alerta.remove();
                }
            });
        }, 5000);
    }
}


function inicializarAnimacoesCards() {
    
    const petCards = document.querySelectorAll('.pet-card');
    petCards.forEach((card, index) => {
        card.style.setProperty('--animal-index', index % 12);
        
        
        const petItems = card.querySelectorAll('.pet-item');
        petItems.forEach(item => {
            
            const icone = item.querySelector('i');
            if (icone) {
                if (icone.classList.contains('fa-mars') || icone.classList.contains('fa-venus')) {
                    
                    icone.style.transition = 'all 0.3s ease';
                    item.addEventListener('mouseenter', function() {
                        icone.style.transform = 'scale(1.2) rotate(15deg)';
                    });
                    item.addEventListener('mouseleave', function() {
                        icone.style.transform = '';
                    });
                }
                else if (icone.classList.contains('fa-ruler')) {
                    
                    icone.style.transition = 'all 0.3s ease';
                    item.addEventListener('mouseenter', function() {
                        icone.style.transform = 'scale(1.2) translateY(-2px)';
                    });
                    item.addEventListener('mouseleave', function() {
                        icone.style.transform = '';
                    });
                }
                else if (icone.classList.contains('fa-calendar-alt')) {
                    
                    icone.style.transition = 'all 0.3s ease';
                    item.addEventListener('mouseenter', function() {
                        icone.style.transform = 'scale(1.2) rotate(-10deg)';
                    });
                    item.addEventListener('mouseleave', function() {
                        icone.style.transform = '';
                    });
                }
                else if (icone.classList.contains('fa-paw')) {
                    
                    icone.style.transition = 'all 0.3s ease';
                    item.addEventListener('mouseenter', function() {
                        icone.style.transform = 'scale(1.2) rotate(10deg)';
                    });
                    item.addEventListener('mouseleave', function() {
                        icone.style.transform = '';
                    });
                }
            }
            
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
        
        const description = card.querySelector('.pet-description');
        if (description) {
            description.addEventListener('mouseenter', function() {
                this.style.borderTopColor = '#ccc';
                this.style.borderBottomColor = '#ccc';
                this.style.transition = 'all 0.3s ease';
                
                const icone = this.querySelector('.description-icon');
                if (icone) {
                    icone.style.transform = 'scale(1.2)';
                    icone.style.transition = 'transform 0.3s ease';
                }
            });
            
            description.addEventListener('mouseleave', function() {
                this.style.borderTopColor = '';
                this.style.borderBottomColor = '';
                
                const icone = this.querySelector('.description-icon');
                if (icone) {
                    icone.style.transform = '';
                }
            });
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    
    petCards.forEach(card => {
        observer.observe(card);
    });
}


function iniciarCarrosselAutomatico() {
    
    if (intervaloCarrossel) {
        clearInterval(intervaloCarrossel);
    }
    
    
    intervaloCarrossel = setInterval(function() {
        proximoSlide();
    }, 5000);
}

function pararCarrosselAutomatico() {
    if (intervaloCarrossel) {
        clearInterval(intervaloCarrossel);
    }
}

function mudarSlide(indice) {
    
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length === 0) return;
    
    
    if (indice === slideAtual) return;
    
    
    slides[slideAtual].classList.remove('active');
    
    
    slideAtual = indice;
    
    
    if (slideAtual < 0) {
        slideAtual = slides.length - 1;
    } else if (slideAtual >= slides.length) {
        slideAtual = 0;
    }
    
    
    slides[slideAtual].classList.add('active');
}

function slideAnterior() {
    mudarSlide(slideAtual - 1);
}

function proximoSlide() {
    mudarSlide(slideAtual + 1);
}


function calcularItensPorPagina() {
    // Obtém o número de cards por linha com base no layout atual
    const cardsPerRow = obterCardsPorLinha();
    
    // Definimos que queremos mostrar 3 linhas de cards por página
    const linhasPorPagina = 3;
    
    // Calculamos o número base de itens por página (cards por linha * linhas por página)
    // e arredondamos para cima para o múltiplo de 4 mais próximo para melhor distribuição visual
    const valorBase = Math.ceil((cardsPerRow * linhasPorPagina) / 4) * 4;
    
    // Adicionamos alguns cards extras para garantir que a grade fique completa
    // mesmo com diferentes tamanhos de tela
    const valorFinal = valorBase + 4;
    
    // Garantimos um mínimo de 12 cards por página
    const valorMinimo = Math.max(valorFinal, 12);
    
    console.log(`Cards por linha: ${cardsPerRow}, Itens por página calculados: ${valorMinimo}`);
    
    return valorMinimo;
}


function copiarFiltrosParaFormularioNavegacao() {
    
    const formFiltros = document.getElementById('formFiltros');
    const formNavegacao = document.getElementById('formNavegacao');
    
    if (!formFiltros || !formNavegacao) return;
    
    
    if (document.getElementById('filtroNome') && document.getElementById('filtroNomeNav')) {
        document.getElementById('filtroNomeNav').value = document.getElementById('filtroNome').value;
    }
    
    if (document.getElementById('filtroEspecie') && document.getElementById('filtroEspecieNav')) {
        document.getElementById('filtroEspecieNav').value = document.getElementById('filtroEspecie').value;
    }
    
    if (document.getElementById('filtroSexo') && document.getElementById('filtroSexoNav')) {
        document.getElementById('filtroSexoNav').value = document.getElementById('filtroSexo').value;
    }
    
    if (document.getElementById('filtroPorte') && document.getElementById('filtroPorteNav')) {
        document.getElementById('filtroPorteNav').value = document.getElementById('filtroPorte').value;
    }
    
    if (document.getElementById('filtroOrdem') && document.getElementById('filtroOrdemNav')) {
        document.getElementById('filtroOrdemNav').value = document.getElementById('filtroOrdem').value;
    }
    
    
    if (document.getElementById('filtroIdade') && document.getElementById('filtroIdadeNav')) {
        document.getElementById('filtroIdadeNav').value = document.getElementById('filtroIdade').value;
    }
    
    
}


function verificarLayoutEAjustar() {
    const cards = document.querySelectorAll('.pet-card');
    if (cards.length === 0) {
        const mensagemSemPets = document.querySelector('.no-pets-message');
        if (mensagemSemPets) {
            mensagemSemPets.style.display = 'flex';
            mensagemSemPets.innerHTML = `
                <div class="text-center w-100">
                    <i class="fas fa-search fa-4x mb-3 text-muted"></i>
                    <h3>Nenhum pet encontrado</h3>
                    <p>Tente modificar os filtros ou voltar mais tarde.</p>
                    <a href="/usuario/pets/explorar" class="btn btn-primary mt-3">
                        <i class="fas fa-sync-alt me-2"></i> Limpar filtros
                    </a>
                </div>
            `;
        }
        return;
    }
    
    
    let cardsPerRow = obterCardsPorLinha();
    
    
    const paginaAtualElement = document.getElementById('paginaAtual');
    let paginaAtual = 1;
    if (paginaAtualElement) {
        paginaAtual = parseInt(paginaAtualElement.value) || 1;
    }
    
    
    
    
    if (paginaAtual > 1 && cards.length < cardsPerRow) {
        navegarParaPagina(paginaAtual - 1);
        return; 
    }
    
    
    const totalPets = cards.length;
    
    // Usar o valor selecionado pelo usuário
    const seletor = document.getElementById('selectItensPorPagina');
    const itensPorPagina = seletor ? parseInt(seletor.value) || 12 : 12;
    
    ajustarCardsParaTresLinhas();
    
    
    window.addEventListener('resize', function() {
        
        const newCardsPerRow = obterCardsPorLinha();
        
        
        if (newCardsPerRow !== cardsPerRow) {
            
            cardsPerRow = newCardsPerRow;
            
            ajustarCardsParaTresLinhas();
        }
    });
    
    
    
    
    const btnLimparFiltros = document.querySelector('#btnLimparFiltros, .botao-limpar, .clear-button');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', function(e) {
            e.preventDefault();
            limparFiltros();
        });
    }
}


function obterCardsPorLinha() {
    
    const grid = document.querySelector('.pets-grid');
    
    if (!grid || !grid.children || grid.children.length === 0) {
        
        
        
        if (window.innerWidth <= 992) {
            return 2;
        } else if (window.innerWidth <= 1366) {
            return 3;
        } else if (window.innerWidth <= 1920) {
            return 4;
        } else if (window.innerWidth <= 2560) {
            return 5;
        } else {
            return 6;
        }
    }
    
    try {
        
        const firstCard = grid.children[0];
        if (!firstCard) return 4; 
        
        const firstCardRect = firstCard.getBoundingClientRect();
        const firstCardTop = firstCardRect.top;
        
        
        let cardsInFirstRow = 0;
        const tolerance = 5; 
        
        for (let i = 0; i < Math.min(grid.children.length, 12); i++) {
            const rect = grid.children[i].getBoundingClientRect();
            if (Math.abs(rect.top - firstCardTop) <= tolerance) {
                cardsInFirstRow++;
            } else {
                
                break;
            }
        }
        
        
        
        if (cardsInFirstRow <= 0 || cardsInFirstRow > 8) {
            
            const gridStyle = window.getComputedStyle(grid);
            const gridTemplateColumns = gridStyle.getPropertyValue('grid-template-columns');
            
            
            if (gridTemplateColumns.includes('repeat')) {
                const matches = gridTemplateColumns.match(/repeat\((\d+)/);
                if (matches && matches[1]) {
                    const explicitColumns = parseInt(matches[1]);
                    return explicitColumns;
                }
            }
            
            
            if (window.innerWidth <= 992) {
                return 2;
            } else if (window.innerWidth <= 1366) {
                return 3;
            } else if (window.innerWidth <= 1920) {
                return 4;
            } else if (window.innerWidth <= 2560) {
                return 5;
            } else {
                return 6;
            }
        }
        
        return cardsInFirstRow;
    } catch (e) {
        console.error("Erro ao calcular colunas do grid:", e);
        
        
        if (window.innerWidth <= 992) {
            return 2;
        } else if (window.innerWidth <= 1366) {
            return 3;
        } else if (window.innerWidth <= 1920) {
            return 4;
        } else if (window.innerWidth <= 2560) {
            return 5;
        } else {
            return 6;
        }
    }
}


function ajustarCardsParaTresLinhas() {
    const cards = document.querySelectorAll('.pet-card');
    if (cards.length === 0) return;
    
    // Obter o valor de itens por página selecionado pelo usuário
    const seletor = document.getElementById('selectItensPorPagina');
    const itensPorPagina = seletor ? parseInt(seletor.value) || 12 : 12;
    
    // Garantir que não sejam exibidos mais cards do que o limite definido
    const maxCardsToShow = itensPorPagina;
    
    const paginaAtualElement = document.getElementById('paginaAtual');
    const paginaAtual = paginaAtualElement ? (parseInt(paginaAtualElement.value) || 1) : 1;
    
    // Atualizar os campos ocultos do formulário
    if (document.getElementById('itensPorPagina')) {
        document.getElementById('itensPorPagina').value = itensPorPagina;
    }
    
    if (document.getElementById('itensPorPaginaNav')) {
        document.getElementById('itensPorPaginaNav').value = itensPorPagina;
    }
    
    // Exibir apenas o número máximo de cards permitido
    cards.forEach((card, index) => {
        if (index < maxCardsToShow) {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Atualizar o contador de pets
    const cardsVisiveis = Math.min(maxCardsToShow, cards.length);
    atualizarContadorPets(cardsVisiveis);
    
    // Verificar se é necessário navegar para a página anterior
    if (paginaAtualElement) {
        if (paginaAtual > 1 && cards.length === 0) {
            navegarParaPagina(paginaAtual - 1);
        }
    }
    
    return cardsVisiveis;
}


function atualizarContadorPets(cardsVisiveis) {
    const totalCards = document.querySelectorAll('.pet-card').length;
    const contadorTexto = document.querySelector('.contador-texto');
    
    if (contadorTexto) {
        // Obter o valor de itens por página selecionado
        const seletor = document.getElementById('selectItensPorPagina');
        const itensPorPagina = seletor ? parseInt(seletor.value) || 12 : 12;
        
        // Garantir que o número de cards visíveis não ultrapasse o valor de itens por página
        const exibindo = Math.min(cardsVisiveis, totalCards, itensPorPagina);
        
        // Atualizar o contador sem incluir o texto de máximo por página
        contadorTexto.innerHTML = `
            <span>Exibindo</span>
            <strong>${exibindo}</strong>
            <span>de</span>
            <strong>${totalCards}</strong>
            <span>pets</span>
        `;
    }
}

// Função para aplicar automaticamente a mudança de itens por página
function aplicarMudancaItensPorPagina(valor) {
    console.log("Aplicando mudança de itens por página:", valor);
    
    // Converter para número inteiro para garantir que não haja texto adicional
    const valorNumerico = parseInt(valor, 10);
    if (isNaN(valorNumerico)) {
        console.error("Valor inválido para itens por página:", valor);
        return;
    }
    
    // Atualizar os campos ocultos do formulário
    document.getElementById('itensPorPagina').value = valorNumerico;
    document.getElementById('itensPorPaginaNav').value = valorNumerico;
    document.getElementById('paginaAtual').value = 1; // Volta para a primeira página ao mudar itens por página
    
    // Remover inputs de navegação anteriores
    document.querySelectorAll('#formNavegacao input[name="navegacaoPagina"]').forEach(input => {
        input.remove();
    });
    
    // Adicionar um parâmetro para indicar que não é uma navegação de página
    let inputNavegacao = document.createElement('input');
    inputNavegacao.type = 'hidden';
    inputNavegacao.name = 'navegacaoPagina';
    inputNavegacao.value = 'false';
    document.getElementById('formNavegacao').appendChild(inputNavegacao);
    
    // Mostrar indicador de carregamento
    mostrarIndicadorCarregamento();
    
    // Submeter o formulário automaticamente
    document.getElementById('formNavegacao').submit();
}

function navegarParaPagina(pagina) {
    console.log("Função navegarParaPagina chamada com página: " + pagina);
    
    // Definir a página atual no formulário de navegação
    document.getElementById('paginaAtual').value = pagina;
    
    // Copiar os filtros para o formulário de navegação
    copiarFiltrosParaFormularioNavegacao();
    
    // Manter o valor atual de itens por página
    const seletor = document.getElementById('selectItensPorPagina');
    const valorAtual = seletor ? parseInt(seletor.value) || 12 : 12;
    document.getElementById('itensPorPaginaNav').value = valorAtual;
    
    // Adicionar um indicador de carregamento
    mostrarIndicadorCarregamento();
    
    // Adicionar um parâmetro para indicar que é uma navegação de página
    const formNavegacao = document.getElementById('formNavegacao');
    
    // Remover qualquer input de navegação anterior para evitar duplicações
    const inputsAntigos = formNavegacao.querySelectorAll('input[name="navegacaoPagina"]');
    inputsAntigos.forEach(input => input.remove());
    
    // Criar um input hidden para indicar que é uma navegação de página
    let inputNavegacao = document.createElement('input');
    inputNavegacao.type = 'hidden';
    inputNavegacao.name = 'navegacaoPagina';
    inputNavegacao.value = 'true';
    formNavegacao.appendChild(inputNavegacao);
    
    console.log("Submetendo formulário de navegação para página: " + pagina);
    
    // Submeter o formulário de navegação
    formNavegacao.submit();
}

// Função para mostrar o indicador de carregamento
function mostrarIndicadorCarregamento() {
    const petsGrid = document.querySelector('.pets-grid');
    if (petsGrid) {
        // Criar overlay de carregamento
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>';
        loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.background = 'rgba(255,255,255,0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '10';
        
        // Adicionar ao container
        const container = petsGrid.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(loadingOverlay);
        }
    }
}

// Nova função para garantir o funcionamento correto da paginação
function garantirFuncionamentoPaginacao() {
    console.log("Configurando funcionamento da paginação...");
    
    // Garantir que os elementos de paginação estejam sempre visíveis
    $('.paginacao').css('display', 'block');
    $('.pagination').css('display', 'flex');
    $('.paginacao-info').css('display', 'flex');
    $('.itens-por-pagina').css('display', 'flex');
    
    // Aplicar estilos diretamente para garantir visibilidade
    $('.paginacao').attr('style', 'display: block !important');
    $('.pagination').attr('style', 'display: flex !important');
    $('.paginacao-info').attr('style', 'display: flex !important');
    $('.itens-por-pagina').attr('style', 'display: flex !important');
    
    // Remover todos os eventos existentes dos links de paginação
    $('.pagination .page-link').off('click');
    
    // Adicionar novos eventos de clique
    $('.pagination .page-link').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Obter o número da página do atributo data-pagina
        const pagina = $(this).attr('data-pagina');
        console.log("Link de paginação clicado. Página:", pagina);
        
        if (pagina) {
            // Chamar a função de navegação
            navegarParaPagina(pagina);
        }
        
        return false;
    });
    
    // Garantir que o seletor de itens por página funcione corretamente
    const seletor = document.getElementById('selectItensPorPagina');
    if (seletor) {
        // Remover eventos existentes
        $(seletor).off('change');
        
        // Adicionar novo evento
        $(seletor).on('change', function() {
            const itensPorPagina = parseInt(this.value, 10);
            if (!isNaN(itensPorPagina)) {
            console.log("Alterando itens por página para:", itensPorPagina);
            
            document.getElementById('itensPorPagina').value = itensPorPagina;
            document.getElementById('itensPorPaginaNav').value = itensPorPagina;
            document.getElementById('paginaAtual').value = 1; // Volta para a primeira página ao mudar itens por página
            
            // Remover inputs de navegação anteriores
            $('#formNavegacao input[name="navegacaoPagina"]').remove();
            
            // Adicionar um parâmetro para indicar que não é uma navegação de página
            let inputNavegacao = document.createElement('input');
            inputNavegacao.type = 'hidden';
            inputNavegacao.name = 'navegacaoPagina';
            inputNavegacao.value = 'false';
            document.getElementById('formNavegacao').appendChild(inputNavegacao);
            
            // Mostrar indicador de carregamento
            mostrarIndicadorCarregamento();
            
            // Submeter o formulário
            document.getElementById('formNavegacao').submit();
            }
        });
    }
    
    // Verificar se os links têm o atributo data-pagina, se não tiverem, adicionar
    $('.pagination .page-link').each(function() {
        if (!$(this).attr('data-pagina')) {
            const url = new URL(this.href, window.location.origin);
            const pagina = url.searchParams.get('pagina');
            if (pagina) {
                $(this).attr('data-pagina', pagina);
            }
        }
    });
}


function gerenciarBarrasDeProgresso() {
    
    document.querySelectorAll('.carousel-progress-bar').forEach(function(bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
    });
    
    
    setTimeout(function() {
        const activeSlide = document.querySelector('.carousel-item.active');
        if (activeSlide) {
            const progressBar = activeSlide.querySelector('.carousel-progress-bar');
            if (progressBar) {
                
                void progressBar.offsetWidth;
                
                
                progressBar.style.transition = 'width 5s linear';
                progressBar.style.width = '100%';
            }
        }
    }, 50);
}


function inicializarItensPorPagina() {
    // Obter o valor selecionado pelo usuário, se existir
    const seletor = document.getElementById('selectItensPorPagina');
    let valorSelecionado = 12; // Valor padrão
    
    if (seletor) {
        // Garantir que o valor seja um número inteiro
        const valorSeletor = parseInt(seletor.value, 10);
        valorSelecionado = !isNaN(valorSeletor) ? valorSeletor : 12;
        console.log("Valor selecionado pelo usuário:", valorSelecionado);
        
        // Forçar o valor correto no seletor (para garantir que não haja caracteres extras)
        seletor.value = valorSelecionado;
    }
    
    // Usar o valor selecionado pelo usuário em vez de calcular um novo valor
    console.log("Inicializando itens por página:", valorSelecionado);
    
    // Atualizamos os campos ocultos do formulário com o valor selecionado
    if (document.getElementById('itensPorPagina')) {
        document.getElementById('itensPorPagina').value = valorSelecionado;
    }
    
    if (document.getElementById('itensPorPaginaNav')) {
        document.getElementById('itensPorPaginaNav').value = valorSelecionado;
    }
    
    return valorSelecionado;
}

$(document).ready(function() {
    // O manipulador para o seletor de itens por página foi movido para o script principal
});

// Adicionar a nova função para ajustar a largura dos cards
function ajustarLarguraCards() {
    const cards = document.querySelectorAll('.pet-card');
    const grid = document.querySelector('.pets-grid');
    
    if (!grid || cards.length === 0) return;
    
    // Obtém a largura disponível para o grid
    const gridWidth = grid.clientWidth;
    console.log(`Largura do grid: ${gridWidth}px`);
    
    // Obtém o número de cards por linha
    const cardsPerRow = obterCardsPorLinha();
    console.log(`Cards por linha: ${cardsPerRow}`);
    
    // Calcula a largura ideal para cada card com base no espaçamento
    const gap = parseInt(window.getComputedStyle(grid).gap) || 32; // 2rem = 32px por padrão
    const idealCardWidth = Math.floor((gridWidth - (gap * (cardsPerRow - 1))) / cardsPerRow);
    
    console.log(`Largura ideal calculada para cada card: ${idealCardWidth}px`);
    
    // Define um limite máximo para a largura do card
    const maxCardWidth = 420; // Valor máximo definido no CSS
    const cardWidth = Math.min(idealCardWidth, maxCardWidth);
    
    console.log(`Largura final dos cards: ${cardWidth}px`);
    
    // Aplica a largura aos cards
    cards.forEach(card => {
        card.style.maxWidth = `${cardWidth}px`;
        card.style.width = '100%';
    });
}

// Função para forçar o limite de itens por página
function forcarLimiteItensPorPagina() {
    // Obter o valor de itens por página selecionado pelo usuário
    const seletor = document.getElementById('selectItensPorPagina');
    const itensPorPagina = seletor ? parseInt(seletor.value, 10) || 12 : 12;
    
    // Obter todos os cards
    const cards = document.querySelectorAll('.pet-card');
    
    // Ocultar os cards que excedem o limite
    cards.forEach((card, index) => {
        if (index < itensPorPagina) {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
        }
    });
    
    // Atualizar o contador de pets
    const cardsVisiveis = Math.min(itensPorPagina, cards.length);
    atualizarContadorPets(cardsVisiveis);
    
    console.log(`Limitando exibição para ${itensPorPagina} itens por página. Exibindo ${cardsVisiveis} de ${cards.length} cards.`);
}


