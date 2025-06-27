// Variáveis globais do jogo
let larvas = []; // Array para armazenar todos os objetos 'larva' no jogo
let inseticidas = 2; // Quantidade de "inseticidas" (cliques) que o jogador tem
let score = 0; // Pontuação do jogador (insetos eliminados)
let plantaHP = 3; // Pontos de vida atuais das plantas
let plantaMaxHP = 3; // Pontos de vida máximos das plantas
let gameOver = false; // Flag que indica se o jogo acabou (perda)
let gameWon = false; // Flag que indica se o jogo foi ganho
let plantas = []; // Array para armazenar as posições das plantas
let tempo = 0; // Contador de tempo do jogo (usado para spawnar larvas, etc.)
let dificuldade = 1; // Nível de dificuldade do jogo, aumenta a cada onda
let numPlantas = 7; // Número de plantas a serem protegidas

const insetosEmojis = ["🐛", "🐜", "🐞", "🦗", "🦟"]; // Emojis usados para representar os insetos
let particulas = []; // Array para armazenar objetos de partículas (efeitos visuais)

let ondaAtual = 1; // Número da onda atual
let larvasRestantesNaOnda = 0; // Quantidade de larvas que ainda precisam aparecer nesta onda
let larvasMortasNaOnda = 0; // Quantidade de larvas eliminadas nesta onda
let multiplicadorBase = 3; // Multiplicador para o número de larvas e inseticidas por onda
let maxOnda = 10; // Onda máxima para vencer o jogo

let estado = "escolha"; // Estado atual do jogo: "escolha" (power-up), "pausa", "jogando", "fim"
let tempoPausa = 0; // Contador de tempo para a tela de pausa
let tempoMaximoDePausa = 60; // Duração máxima da pausa antes de iniciar a próxima onda

let powerUps = []; // Array para armazenar os power-ups disponíveis para escolha
let powerUpsDisponiveis = []; // Lista completa de todos os power-ups possíveis
let powerUpSelecionado = false; // Flag que indica se um power-up já foi selecionado

let larvasLentas = false; // Flag para o power-up de larvas lentas
let chanceCritico = false; // Flag para o power-up de chance de matar inseto próximo

// Função setup do P5.js: chamada uma vez no início do programa
function setup() {
  createCanvas(600, 400); // Cria o canvas do jogo com 600 pixels de largura e 400 de altura
  textAlign(CENTER, CENTER); // Alinha o texto ao centro (horizontal e vertical)
  textSize(24); // Define o tamanho padrão do texto

  let spacing = 60; // Espaçamento entre as plantas
  // Calcula a posição Y inicial para centralizar as plantas verticalmente
  let startY = height / 2 - ((numPlantas - 1) * spacing) / 2;
  // Loop para criar e posicionar as plantas
  for (let i = 0; i < numPlantas; i++) {
    // Adiciona um vetor (posição x, y) para cada planta no array 'plantas'
    plantas.push(createVector(width - 80, startY + i * spacing));
  }

  escolherPowerUps(); // Chama a função para apresentar a escolha de power-ups iniciais
}

// Função draw do P5.js: chamada repetidamente a cada frame
function draw() {
  background("#c8e6c9"); // Define a cor de fundo do canvas (verde claro)

  // Verifica o estado atual do jogo
  if (estado === "escolha") {
    mostrarEscolhaDePowerUp(); // Exibe a tela de escolha de power-up
    return; // Sai da função draw para não executar o resto do código do jogo
  }

  tempo++; // Incrementa o contador de tempo a cada frame

  // Exibe informações do jogo na tela
  fill(0); // Define a cor de preenchimento para o texto (preto)
  textSize(16); // Define o tamanho da fonte para as informações
  text(`Inseticidas: ${inseticidas}`, 100, 30); // Mostra a quantidade de inseticidas
  text(`Insetos eliminados: ${score}`, 100, 50); // Mostra a pontuação (insetos eliminados)
  text(`Vida das plantas: ${plantaHP}/${plantaMaxHP}`, 100, 70); // Mostra a vida das plantas
  text(`🌊 Onda: ${ondaAtual}`, 500, 30); // Mostra a onda atual

  // Se o jogo está em pausa (entre ondas)
  if (estado === "pausa") {
    textSize(32); // Aumenta o tamanho do texto para a mensagem de pausa
    text(`🌊 Preparando Onda ${ondaAtual}...`, width / 2, height / 2); // Mensagem de preparação de onda
    tempoPausa++; // Incrementa o contador de tempo de pausa
    // Se o tempo de pausa exceder o tempo máximo
    if (tempoPausa > tempoMaximoDePausa) {
      estado = "jogando"; // Muda o estado do jogo para "jogando"
      iniciarOnda(); // Inicia a próxima onda
    }
    return; // Sai da função draw para não executar o resto do código do jogo
  }

  // Desenhar plantas
  textSize(30); // Define o tamanho do texto para os emojis das plantas
  for (let planta of plantas) {
    text("🌾", planta.x, planta.y); // Desenha o emoji de planta em cada posição
  }

  // Mostrar larvas e mover
  // Loop através de todas as larvas
  for (let larva of larvas) {
    if (!larva.dead) { // Verifica se a larva não está morta
      textSize(30); // Define o tamanho do texto para o emoji da larva
      text(larva.emoji, larva.pos.x, larva.pos.y); // Desenha o emoji da larva na sua posição
      larva.move(); // Chama o método 'move' da larva para atualizar sua posição

      // Verifica colisão das larvas com as plantas
      for (let planta of plantas) {
        // Se a distância entre a larva e a planta for menor que 30 (colisão)
        if (dist(larva.pos.x, larva.pos.y, planta.x, planta.y) < 30) {
          plantaHP--; // Diminui a vida da planta
          larva.dead = true; // Marca a larva como morta
          larvasMortasNaOnda++; // Incrementa o contador de larvas mortas na onda
          criarParticulas(larva.pos.x, larva.pos.y); // Cria partículas no local da larva morta
          checarNovaOnda(); // Verifica se é hora de iniciar uma nova onda
          // Se a vida da planta chegar a zero
          if (plantaHP <= 0) {
            gameOver = true; // Define o jogo como "game over"
            estado = "fim"; // Muda o estado do jogo para "fim"
            noLoop(); // Para o loop principal do P5.js (para a animação)
          }
          break; // Sai do loop de plantas, pois a larva já colidiu
        }
      }
    }
  }

  // Atualiza e mostra as partículas
  // Loop reverso para remover partículas sem causar problemas de índice
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].update(); // Atualiza a posição e opacidade da partícula
    particulas[i].show(); // Desenha a partícula
    if (particulas[i].finished()) { // Se a partícula "terminou" (sumiu)
      particulas.splice(i, 1); // Remove a partícula do array
    }
  }

  // Tela de Game Over
  if (gameOver) {
    fill(255, 0, 0); // Define a cor do texto para vermelho
    textSize(32); // Aumenta o tamanho do texto
    text("💀 As plantas morreram!", width / 2, height / 2); // Exibe a mensagem de game over
    noLoop(); // Para o loop principal do P5.js
  }

  // Tela de Jogo Ganho
  if (gameWon) {
    fill(0, 180, 0); // Define a cor do texto para verde
    textSize(32); // Aumenta o tamanho do texto
    text("🌟 Você salvou as plantas!", width / 2, height / 2); // Exibe a mensagem de vitória
    noLoop(); // Para o loop principal do P5.js
  }
}

// Função mousePressed do P5.js: chamada quando o botão do mouse é pressionado
function mousePressed() {
  // Se o jogo está no estado de escolha de power-up
  if (estado === "escolha") {
    // Loop através dos power-ups disponíveis para escolha
    for (let i = 0; i < powerUps.length; i++) {
      let y = 150 + i * 60; // Calcula a posição Y de cada botão de power-up
      // Verifica se o clique do mouse está dentro da área de um power-up
      if (mouseY > y - 20 && mouseY < y + 20) {
        aplicarPowerUp(powerUps[i]); // Aplica o power-up selecionado
        estado = "pausa"; // Muda o estado do jogo para "pausa"
        tempoPausa = 0; // Reseta o contador de tempo de pausa
        return; // Sai da função, pois um power-up foi selecionado
      }
    }
  }

  // Se não há inseticidas, ou o jogo acabou, ou não está no estado "jogando", não faz nada
  if (inseticidas <= 0 || gameOver || gameWon || estado !== "jogando") return;

  inseticidas--; // Decrementa a quantidade de inseticidas (um clique usado)

  let larvaMortaNesteClique = false; // Flag para verificar se uma larva foi morta pelo clique direto

  // Loop através de todas as larvas para verificar se alguma foi clicada
  for (let larva of larvas) {
    // Se a larva não está morta e o clique está perto dela (distância menor que 30)
    if (!larva.dead && dist(mouseX, mouseY, larva.pos.x, larva.pos.y) < 30) {
      larva.dead = true; // Marca a larva como morta
      score++; // Aumenta a pontuação
      larvasMortasNaOnda++; // Incrementa o contador de larvas mortas na onda
      criarParticulas(larva.pos.x, larva.pos.y); // Cria partículas no local da larva morta
      larvaMortaNesteClique = true; // Define a flag como verdadeira
      break; // Sai do loop, pois a larva clicada já foi processada
    }
  }

  // Se uma larva foi morta pelo clique E o power-up de crítico está ativo E a chance de 30% é atingida
  if (larvaMortaNesteClique && chanceCritico && random() < 0.3) {
    matarLarvaProxima(mouseX, mouseY); // Chama a função para matar uma larva próxima
  }

  checarNovaOnda(); // Verifica se é hora de iniciar uma nova onda
}

// Função para matar uma larva próxima ao ponto (x, y)
function matarLarvaProxima(x, y) {
  // Filtra as larvas para obter apenas as que estão vivas
  let larvasAtivas = larvas.filter(l => !l.dead);
  if (larvasAtivas.length === 0) return; // Se não há larvas ativas, sai da função

  let larvaMaisProxima = null; // Variável para armazenar a larva mais próxima
  let menorDistancia = Infinity; // Inicializa a menor distância como infinita

  // Loop através das larvas ativas para encontrar a mais próxima
  for (let larva of larvasAtivas) {
    let d = dist(x, y, larva.pos.x, larva.pos.y); // Calcula a distância da larva ao ponto (x, y)
    if (d < menorDistancia) { // Se esta larva é mais próxima que a anterior
      menorDistancia = d; // Atualiza a menor distância
      larvaMaisProxima = larva; // Armazena esta larva como a mais próxima
    }
  }

  // Se uma larva mais próxima foi encontrada
  if (larvaMaisProxima) {
    larvaMaisProxima.dead = true; // Marca a larva mais próxima como morta
    score++; // Aumenta a pontuação
    larvasMortasNaOnda++; // Incrementa o contador de larvas mortas na onda
    criarParticulas(larvaMaisProxima.pos.x, larvaMaisProxima.pos.y); // Cria partículas no local da larva morta
  }
}

// Função para spawnar uma nova larva
function spawnLarva() {
  // Se não há mais larvas para spawnar na onda, ou o jogo acabou, ou não está no estado "jogando", não faz nada
  if (larvasRestantesNaOnda <= 0 || gameOver || gameWon || estado !== "jogando") return;

  larvasRestantesNaOnda--; // Decrementa o contador de larvas restantes para spawnar

  // Adiciona um novo objeto larva ao array 'larvas'
  larvas.push({
    pos: createVector(0, random(40, height - 40)), // Posição inicial da larva (sempre na esquerda, Y aleatório)
    // Velocidade da larva, ajustada pelo power-up de lentidão e dificuldade
    speed: (larvasLentas ? 0.8 : 1.2) + random(0.5) * dificuldade,
    angle: random(-0.05, 0.05), // Ângulo para um movimento sinoidal leve
    dead: false, // Estado inicial: larva viva
    emoji: random(insetosEmojis), // Emoji aleatório para a larva
    move: function () { // Método de movimento da larva
      this.pos.x += this.speed; // Move a larva para a direita
      this.pos.y += sin(frameCount * this.angle) * 1.5; // Adiciona um movimento vertical sinoidal
      this.pos.y = constrain(this.pos.y, 20, height - 20); // Mantém a larva dentro dos limites verticais do canvas
    },
  });

  // Agenda a próxima chamada da função spawnLarva com um atraso aleatório
  setTimeout(spawnLarva, random(1500 / dificuldade, 3000 / dificuldade));
}

// Função para iniciar uma nova onda de jogo
function iniciarOnda() {
  // Se a onda atual exceder o número máximo de ondas, o jogador venceu
  if (ondaAtual > maxOnda) {
    gameWon = true; // Define o jogo como "ganho"
    estado = "fim"; // Muda o estado do jogo para "fim"
    noLoop(); // Para o loop principal do P5.js
    return; // Sai da função
  }

  dificuldade += 0.3; // Aumenta a dificuldade do jogo
  larvasMortasNaOnda = 0; // Reseta o contador de larvas mortas para a nova onda
  larvas = []; // Limpa o array de larvas (remove as larvas da onda anterior)
  // Calcula a quantidade de larvas a serem spawnadas nesta onda
  larvasRestantesNaOnda = ondaAtual * multiplicadorBase;
  // Calcula a quantidade de inseticidas para esta onda
  inseticidas = ondaAtual * multiplicadorBase;

  larvasLentas = false; // Reseta o power-up de larvas lentas para cada nova onda
  chanceCritico = false; // Reseta o power-up de chance crítica para cada nova onda

  spawnLarva(); // Chama a função para começar a spawnar larvas para a nova onda
}

// Função para verificar se é hora de iniciar uma nova onda
function checarNovaOnda() {
  let totalEsperado = ondaAtual * multiplicadorBase; // Calcula o total de larvas esperadas para a onda
  // Se o número de larvas mortas atingiu ou ultrapassou o total esperado
  if (larvasMortasNaOnda >= totalEsperado) {
    ondaAtual++; // Incrementa o número da onda
    escolherPowerUps(); // Chama a tela de escolha de power-ups para a próxima onda
  }
}

// Função para exibir a tela de escolha de Perks
function mostrarEscolhaDePowerUp() {
  background(220); // Define um fundo cinza claro para a tela de escolha
  fill(0); // Define a cor do texto para preto
  textSize(28); // Define o tamanho do texto para o título
  text("Escolha uma Perk:", width / 2, 80); // Exibe o título
  textSize(18); // Define o tamanho do texto para os nomes dos power-ups
  // Loop para desenhar os botões de power-up
  for (let i = 0; i < powerUps.length; i++) {
    let y = 150 + i * 60; // Calcula a posição Y de cada botão
    fill(255); // Define a cor de preenchimento para o botão (branco)
    rect(100, y - 20, 400, 40, 10); // Desenha o retângulo do botão com bordas arredondadas
    fill(0); // Define a cor do texto para preto
    text(powerUps[i].nome, width / 2, y); // Exibe o nome do power-up no centro do botão
  }
}

// Função para configurar os power-ups disponíveis para a escolha
function escolherPowerUps() {
  estado = "escolha"; // Define o estado do jogo como "escolha" de power-up
  powerUpSelecionado = false; // Reseta a flag de power-up selecionado

  // Lista de todos os power-ups possíveis e seus efeitos
  powerUpsDisponiveis = [
    {
      nome: "+1 Vida Máxima da Planta", // Nome do power-up
      efeito: () => { // Função de efeito do power-up
        plantaMaxHP++; // Aumenta a vida máxima da planta
        plantaHP++; // Cura a planta em 1 ponto (ou até o novo máximo)
      },
    },
    {
      nome: "+1 de Cura nas Plantas",
      efeito: () => {
        if (plantaHP < plantaMaxHP) plantaHP++; // Cura a planta em 1 ponto, sem exceder a vida máxima
      },
    },
    {
      nome: "+2 Inseticidas Extras",
      efeito: () => {
        inseticidas += 2; // Adiciona 2 inseticidas extras
      },
    },
    {
      nome: "Larvas mais lentas na próxima onda",
      efeito: () => {
        larvasLentas = true; // Ativa a flag para larvas mais lentas
      },
    },
    {
      nome: "30% de chance de eliminar um inseto próximo", // Novo nome do power-up
      efeito: () => {
        chanceCritico = true; // Ativa a flag para a chance de matar inseto próximo
      },
    },
  ];

  shuffle(powerUpsDisponiveis, true); // Embaralha a lista de power-ups disponíveis
  powerUps = powerUpsDisponiveis.slice(0, 3); // Seleciona os primeiros 3 power-ups para a escolha
}

// Função para aplicar o efeito do power-up selecionado
function aplicarPowerUp(powerUp) {
  powerUp.efeito(); // Executa a função de efeito associada ao power-up
}

// Função para criar partículas visuais (ex: ao matar um inseto)
function criarParticulas(x, y) {
  for (let i = 0; i < 15; i++) { // Cria 15 partículas
    particulas.push(new Particula(x, y)); // Adiciona uma nova instância de Particula ao array
  }
}

// Classe Particula: Define as propriedades e comportamento de uma partícula
class Particula {
  constructor(x, y) {
    this.pos = createVector(x, y); // Posição inicial da partícula
    this.vel = p5.Vector.random2D(); // Vetor de velocidade aleatória em 2D
    this.vel.mult(random(1, 3)); // Multiplica a velocidade por um valor aleatório para variar o movimento
    this.alpha = 255; // Opacidade inicial (totalmente visível)
    this.size = random(4, 8); // Tamanho aleatório da partícula
  }

  update() {
    this.pos.add(this.vel); // Atualiza a posição da partícula com base na velocidade
    this.alpha -= 8; // Diminui a opacidade da partícula (fazendo-a desaparecer)
  }

  finished() {
    return this.alpha < 0; // Retorna true se a partícula ficou invisível
  }

  show() {
    noStroke(); // Não desenha contorno para as partículas
    fill(255, 150, 0, this.alpha); // Define a cor de preenchimento (laranja com opacidade variável)
    ellipse(this.pos.x, this.pos.y, this.size); // Desenha a partícula como uma elipse
  }
}