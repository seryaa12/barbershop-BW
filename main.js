// script.js - Coloque este código em um arquivo separado

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initNavbar();
    initContador();
    initForm();
    initScrollAnimations();
    initBtnTopo();
    initModal();
    initLoader();
});

// 1. NAVBAR SCROLL EFFECT
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Ativar link ativo
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// 2. CONTADOR ANIMADO
function initContador() {
    const contadores = document.querySelectorAll('.contador-numero');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const contador = entry.target;
                const target = +contador.getAttribute('data-target');
                const speed = 200;
                const updateCount = () => {
                    const count = +contador.innerText;
                    const increment = target / speed;
                    
                    if (count < target) {
                        contador.innerText = Math.ceil(count + increment);
                        setTimeout(updateCount, 10);
                    } else {
                        contador.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(contador);
            }
        });
    }, { threshold: 0.5 });
    
    contadores.forEach(contador => observer.observe(contador));
}

// 3. FORMULÁRIO
function initForm() {
    const form = document.getElementById('formAgendamento');
    if (!form) return;
    
    // Formatação de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
            e.target.value = value;
        });
    }
    
    // Configurar data mínima
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.min = hoje;
        dataInput.value = hoje;
    }
    
    // Gerar horários
    gerarHorarios();
    
    // Envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validar
        if (!data.nome || !data.telefone || !data.servico || !data.data || !data.horario) {
            mostrarAlerta('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // Salvar no localStorage
        salvarAgendamento(data);
        
        // Mostrar confirmação
        mostrarConfirmacao(data);
        
        // Resetar formulário
        form.reset();
        gerarHorarios();
    });
}

function gerarHorarios() {
    const select = document.getElementById('horario');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um horário</option>';
    const horarios = [];
    
    for (let hora = 9; hora <= 19; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const horaStr = hora.toString().padStart(2, '0');
            const minutoStr = minuto.toString().padStart(2, '0');
            horarios.push(`${horaStr}:${minutoStr}`);
        }
    }
    
    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        select.appendChild(option);
    });
}

function salvarAgendamento(data) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos_bw')) || [];
    agendamentos.push({
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('agendamentos_bw', JSON.stringify(agendamentos));
}

// 4. ANIMAÇÕES DE SCROLL
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// 5. BOTÃO VOLTAR AO TOPO
function initBtnTopo() {
    const btn = document.createElement('button');
    btn.className = 'btn-topo';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 6. MODAL E ALERTAS
function initModal() {
    // Criar modal dinâmico se necessário
    const modalHTML = `
        <div class="modal fade" id="modalConfirm" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Agendamento Confirmado!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p id="modalMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-agendar" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (!document.getElementById('modalConfirm')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function mostrarConfirmacao(data) {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirm'));
    const message = document.getElementById('modalMessage');
    
    const dataObj = new Date(data.data);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    message.innerHTML = `
        <p><strong>${data.nome}</strong>, seu agendamento foi confirmado!</p>
        <p><strong>Serviço:</strong> ${data.servico}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Horário:</strong> ${data.horario}</p>
        <p><strong>Telefone:</strong> ${data.telefone}</p>
        <p class="mt-3">Entraremos em contato para confirmação.</p>
    `;
    
    modal.show();
}

function mostrarAlerta(mensagem, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo === 'error' ? 'danger' : tipo} alert-dismissible fade show`;
    alerta.role = 'alert';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.form-container') || document.body;
    container.prepend(alerta);
    
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, 5000);
}

// 7. LOADER INICIAL
function initLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.prepend(loader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }, 800);
    });
}

// 8. FUNÇÕES AUXILIARES
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Exportar funções para uso global (opcional)
window.BW = {
    scrollToSection,
    formatarMoeda,
    mostrarAlerta
};