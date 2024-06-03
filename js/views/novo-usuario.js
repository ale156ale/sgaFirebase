'use strict'; // modo estrito

document.addEventListener('DOMContentLoaded', () => {
  const sexo = "Masculino"; // ou "Feminino"

  // Marca o rádio button correspondente ao valor de 'sexo'
  if (sexo === 'Masculino') {
    document.getElementById('sexoM').checked = true;
  } else {
    document.getElementById('sexoF').checked = true;
  }

  // Atalhos para os elementos DOM - Document Object Model
  const formNovoUsuario = document.getElementById('formNovoUsuario');

  formNovoUsuario.addEventListener('submit', (event) => {
    event.preventDefault();

    const usuario = document.getElementById('nomeNovo').value;
    const email = document.getElementById('emailNovo').value;
    const senha = document.getElementById('senhaNovo').value;
    const cpf = document.getElementById('cpfNovo').value;
    const turma = document.getElementById('turmaNovo').value;
    const nota1 = 0;
    const nota2 = 0;
    const nota3 = 0;
    const nota4 = 0;
    const nascimento = document.getElementById('nascimentoNovo').value;
    const privilegio = "Aguardando aprovação";
    const sexoSelecionado = document.querySelector('input[name="sexo"]:checked').value;

    // Verifica os campos obrigatórios
    if (usuario === '') {
      document.getElementById('nomeNovo').focus();
      alerta('⚠️ É obrigatório informar o nome!', 'warning');
    } else if (usuario.length < 5) {
      document.getElementById('nomeNovo').focus();
      alerta(`⚠️ O nome informado é muito curto. Foram informados ${usuario.length} caracteres. Informe no mínimo 5 caracteres`, 'warning');
    } else if (usuario.length > 100) {
      document.getElementById('nomeNovo').focus();
      alerta(`⚠️ O nome informado é muito longo. Foram informados ${usuario.length} caracteres. Informe no máximo 100 caracteres`, 'warning');
    } else if (email === '') {
      document.getElementById('emailNovo').focus();
      alerta('⚠️ É obrigatório informar o email!', 'warning');
    } else if (!validarEmail(email)) {
      document.getElementById('emailNovo').focus();
      alerta('⚠️ O email informado é inválido!', 'warning');
    } else if (cpf === '' || cpf.length !== 14) {
      document.getElementById('cpfNovo').focus();
      alerta('⚠️ É obrigatório informar um CPF válido!', 'warning');
    } else if (nascimento === '' || !validarDataNascimento(nascimento)) {
      document.getElementById('nascimentoNovo').focus();
      alerta('⚠️ É obrigatório informar uma data de nascimento válida e anterior à data atual!', 'warning');
    } else {
      // Todos os campos estão preenchidos corretamente, chama a função para criar o novo usuário
      novoUsuario(usuario, email, senha, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexoSelecionado);
    }
  });
});

/**
 * Formata o valor do campo de CPF com pontos e traço enquanto o usuário digita os dados.
 *
 * @param {object} campo - O campo de entrada do CPF.
 */
function formatarCPF(campo) {
  // Remove caracteres não numéricos
  let cpf = campo.value.replace(/\D/g, '');

  // Adiciona pontos e traço conforme o usuário digita
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  // Atualiza o valor do campo
  campo.value = cpf;
}

// Função para validar o formato da data de nascimento
function validarDataNascimento(dataNascimento) {
  // Converte a string da data de nascimento para um objeto Date
  const dataNascimentoConvertida = new Date(dataNascimento);
  // Verifica se a data de nascimento é válida (não NaN)
  if (isNaN(dataNascimentoConvertida)) {
    return false;
  }
  // Obtém a data de hoje
  const dataHoje = new Date();
  // Compara a data de nascimento com a data de hoje
  return dataNascimentoConvertida < dataHoje;
}

// Função para validar o formato do email
function validarEmail(email) {
  // Expressão regular para validar o formato do email
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}
