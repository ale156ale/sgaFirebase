
'use strict' //modo estrito

/**
/**
 * @param {string} collection - Nome da collection no Firebase
 * @return {object} - Uma tabela com os dados obtidos
 */
async function obtemDados(collection) {
  let spinner = document.getElementById('carregandoDados');
  let tabela = document.getElementById('tabelaDados');
  await firebase.database().ref(collection).orderByChild('nome').on('value', (snapshot) => {
    tabela.innerHTML = '';
    tabela.innerHTML += `<tr>    
    <th>Nome</th>
    <th>CPF</th>
    <th>Turma</th>
    <th>1º Nota</th>
    <th>2ª Nota</th>
    <th>3ª Nota</th>
    <th>4ª Nota</th>
    <th>Média Final</th>
    <th>Status</th>
    <th>Opções</th>`;

    let alunoCount = 0;

    snapshot.forEach(item => {
      if (item.val().privilegio === 'aluno') {
        alunoCount++;
        // Dados do Firebase
        let db = item.ref._delegate._path.pieces_[0]; // collection
        let id = item.ref._delegate._path.pieces_[1]; // id do registro

        // Criando as novas linhas na tabela
        let novaLinha = tabela.insertRow();
        novaLinha.insertCell().innerHTML = '<small class="text-dark">' + item.val().usuario + '</small>';
        novaLinha.insertCell().innerHTML = '<small class="text-dark">' + item.val().cpf + '</small>';
        novaLinha.insertCell().innerHTML = '<small class="text-dark">' + item.val().turma + '</small>';

        // Obtendo e formatando as notas
        let nota1 = parseFloat(item.val().nota1);
        let nota2 = parseFloat(item.val().nota2);
        let nota3 = parseFloat(item.val().nota3);
        let nota4 = parseFloat(item.val().nota4);

        // Função para criar célula com classe e conteúdo formatado
        function createCellWithClass(row, value) {
          let cell = row.insertCell();
          cell.textContent = new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(value);
          cell.className = 'text-dark';
        }

        // Criando células com notas formatadas
        createCellWithClass(novaLinha, nota1);
        createCellWithClass(novaLinha, nota2);
        createCellWithClass(novaLinha, nota3);
        createCellWithClass(novaLinha, nota4);

        // Calculando e formatando a média
        let media = (nota1 + nota2 + nota3 + nota4) / 4;
        createCellWithClass(novaLinha, media);
        let statusCell = novaLinha.insertCell();
        if (media >= 5) {
          statusCell.innerHTML = '<span class="btn btn-success btn-xs">Aprovado</span>';
        } else {
          statusCell.innerHTML = '<span class="btn btn-danger btn-xs">Reprovado</span>';
        }

        novaLinha.insertCell().innerHTML = `
        <div class="btn-group" role="group" aria-label="Ações">
        <button class='btn btn-sm btn-danger' onclick=remover('${db}','${id}')><i class="fa fa-trash"></i></button>
        <button class='btn btn-sm btn-warning' data-toggle="modal" data-target="#bd-example-modal-lg" onclick=carregaDadosAlteracao('${db}','${id}')><i class="fa fa-edit"></i></button>
        <button class='btn btn-sm btn-info privilegio-administrador' style="display:none;" data-toggle="modal" data-target="#bd-senha-modal-lg" onclick=carregaDadosAlteracaoSenha('${db}','${id}')><i class="fa fa-envelope"></i></button>
    </div>
          `;
      }
    });

    let rodape = tabela.insertRow();
    rodape.className = 'fundo-laranja-claro';
    rodape.insertCell().colSpan = "9";
    rodape.insertCell().innerHTML = alunoCount === 0
      ? '⚠️ Ainda não há nenhum registro cadastrado!'
      : `Total: <strong><span> ${alunoCount} </span></strong>`;
  });
  spinner.classList.add('d-none'); // oculta o carregando...
}

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {object} - Os dados do registro serão vinculados aos inputs do formulário.
 */

async function carregaDadosAlteracao(db, id) {
  await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
    document.getElementById('id').value = id
    document.getElementById('nome').value = snapshot.val().usuario
    document.getElementById('cpf').value = snapshot.val().cpf
    document.getElementById('email').value = snapshot.val().email
    document.getElementById('turma').value = snapshot.val().turma
    document.getElementById('nascimento').value = snapshot.val().nascimento
    document.getElementById('nota1').value = snapshot.val().nota1
    document.getElementById('nota2').value = snapshot.val().nota2
    document.getElementById('nota3').value = snapshot.val().nota3
    document.getElementById('nota4').value = snapshot.val().nota4


    if (snapshot.val().sexo === 'Masculino') {
      document.getElementById('sexoM').checked = true
    } else {
      document.getElementById('sexoF').checked = true
    }
  })

  document.getElementById('nome').focus() //Definimos o foco no campo nome
}



/**
 * incluir.
 * Inclui os dados do formulário na collection do Firebase.
 * @param {object} event - Evento do objeto clicado
 * @param {string} collection - Nome da collection no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */

function salvar(event, collection) {
  event.preventDefault() // evita que o formulário seja recarregado
  //Verifica os campos obrigatórios
  if (document.getElementById('nome').value === '') {
    document.getElementById('nome').focus()
    alerta('⚠️É obrigatório informar o nome!', 'warning')
  }
  else if (document.getElementById('nome').value.length < 5) {
    document.getElementById('nome').focus()
    alerta(`⚠️O nome informado é muito curto. <br>Foram informados <strong> ${document.getElementById('nome').value.length} </strong> caracteres. Informe no mínimo 5 caracteres`, 'warning')
  }
  else if (document.getElementById('nome').value.length > 100) {
    document.getElementById('nome').focus()
    alerta(`⚠️O nome informado é muito longo. <br>Foram informados <strong> ${document.getElementById('nome').value.length} </strong> caracteres. Informe no máximo 100 caracteres`, 'warning')
  }
  else if (document.getElementById('email').value === '') {
    document.getElementById('email').focus()
    alerta('⚠️É obrigatório informar o email!', 'warning')
  }
  else if (!validarEmail(document.getElementById('email').value)) {
    document.getElementById('email').focus()
    alerta('⚠️O email informado é inválido!', 'warning')
  }
  else if (document.getElementById('nascimento').value === '') {
    document.getElementById('nascimento').focus()
    alerta('⚠️É obrigatório informar o nascimento!', 'warning')
  } else if (!validarDataNascimento(document.getElementById('nascimento').value)) {
    document.getElementById('nascimento').focus()
    alerta('⚠️A data de nascimento informada é inválida ou posterior à data de hoje!', 'warning')
  }
  else if (document.getElementById('nota1').value < 0 || document.getElementById('nota1').value > 10) {
    document.getElementById('nota1').focus()
    alerta(`⚠️O 1º Nota deve ser um número entre 0 a 10 e foi informado o valor ${document.getElementById('nota1').value}`, 'warning')
  }
  else if (document.getElementById('nota2').value < 0 || document.getElementById('nota2').value > 10) {
    document.getElementById('nota2').focus()
    alerta(`⚠️A 2ª Nota deve ser um número entre 0 a 10 e foi informado o valor ${document.getElementById('nota2').value}`, 'warning')
  }
  else if (document.getElementById('nota3').value < 0 || document.getElementById('nota3').value > 10) {
    document.getElementById('nota3').focus()
    alerta(`⚠️A 3ª Nota deve ser um número entre 0 a 10 e foi informado o valor ${document.getElementById('nota3').value}`, 'warning')
  }
  else if (document.getElementById('nota4').value < 0 || document.getElementById('nota4').value > 10) {
    document.getElementById('nota4').focus()
    alerta(`⚠️A 4ª Nota deve ser um número entre 0 a 10 e foi informado o valor ${document.getElementById('nota4').value}`, 'warning')
  }
  else if (document.getElementById('id').value !== '') { alterar(event, collection) }
  else { incluir(event, collection) }
}

async function carregaDadosAlteracaoSenha(db, id) {
  const userRef = firebase.database().ref(db + '/' + id);
  userRef.once('value', (snapshot) => {
    const userData = snapshot.val();
    document.getElementById('emailenviosenha').value = userData.email;
  });
}


function enviarEmailRedefinicao() {
  const email = document.getElementById('emailenviosenha').value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alerta('✅ Email de redefinição de senha enviado com sucesso!', 'success');
      $('#bd-senha-modal-lg').modal('hide');
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      alerta('❌ Falha ao enviar email de redefinição de senha: ' + error.message, 'danger');
    });
}


async function alterar(event, collection) {
  let usuarioAtual = firebase.auth().currentUser
  let botaoSalvar = document.getElementById('btnSalvar')
  botaoSalvar.innerText = 'Aguarde...'
  event.preventDefault()
  //Obtendo os campos do formulário
  const form = document.forms[0];
  const data = new FormData(form);
  //Obtendo os valores dos campos
  const values = Object.fromEntries(data.entries());
  //Enviando os dados dos campos para o Firebase
  return await firebase.database().ref().child(collection + '/' + values.id).update({
    usuario: values.nome.toUpperCase(),
      email: values.email.toLowerCase(),
      turma: values.turma,
      sexo: values.sexo,
      nascimento: values.nascimento,
      nota1: values.nota1,
      nota2: values.nota2,
      nota3: values.nota3,
      nota4: values.nota4,
      cpf: values.cpf,
      usuarioAlteracao: {
        uid: usuarioAtual.uid,
        usuario: usuarioAtual.displayName,
        email: usuarioAtual.email,
        dataAlteracao: new Date()
    }
  })
    .then(() => {
      alerta('✅ Registro alterado com sucesso!', 'success')
      document.getElementById('formCadastro').reset()
      document.getElementById('id').value = ''
      botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar'
    })
    .catch(error => {
      console.error(error.code)
      console.error(error.message)
      alerta('❌ Falha ao alterar: ' + error.message, 'danger')
    })
}



/**
 * remover.
 * Remove os dados da collection a partir do id passado.
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */
async function remover(db, id) {
  if (window.confirm("⚠️Confirma a exclusão do registro?")) {
    let dadoExclusao = await firebase.database().ref().child(db + '/' + id)
    dadoExclusao.remove()
      .then(() => {
        alerta('✅ Registro removido com sucesso!', 'success')
      })
      .catch(error => {
        console.error(error.code)
        console.error(error.message)
        alerta('❌ Falha ao excluir: ' + error.message, 'danger')
      })
  }
}


/**
 * totalRegistros
 * Retornar a contagem do total de registros da collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */

function totalRegistros(collection) {
  let retorno = '...'
  firebase.database().ref(collection).on('value', (snap) => {
    if (snap.numChildren() === 0) {
      retorno = '⚠️ Ainda não há nenhum registro cadastrado!'
    } else {
      retorno = `Total: <span class="badge fundo-laranja-escuro"> ${snap.numChildren()} </span>`
    }
  })
  return retorno
}

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


/**
 * Filtra os elementos de uma tabela com base no valor inserido em um campo de filtro.
 *
 * @param {string} idFiltro - O ID do campo de filtro de entrada.
 * @param {string} idTabela - O ID da tabela que será filtrada.
 */
function filtrarTabela(idFiltro, idTabela) {
  var input, filter, table, tr, td, i, j, txtValue;
  input = document.getElementById(idFiltro);
  filter = input.value.toUpperCase();
  table = document.getElementById(idTabela);
  tr = table.getElementsByTagName("tr");

  for (i = 1; i < tr.length; i++) {
    tr[i].style.display = "none"; // Oculte todas as linhas do corpo da tabela inicialmente.
    for (j = 0; j < tr[i].cells.length; j++) {
      td = tr[i].cells[j];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = ""; // Exiba a linha se houver correspondência.
          break; // Saia do loop interno quando encontrar uma correspondência.
        }
      }
    }
  }
}

// Função para validar o formato da data de nascimento
function validarDataNascimento(dataNascimento) {
  // Converte a string da data de nascimento para um objeto Date
  const dataNascimentoConvertida = new Date(dataNascimento)
  // Verifica se a data de nascimento é válida (não NaN)
  if (isNaN(dataNascimentoConvertida)) {
    return false
  }
  // Obtém a data de hoje
  const dataHoje = new Date()
  // Compara a data de nascimento com a data de hoje
  return dataNascimentoConvertida < dataHoje
}

// Função para validar o formato do email
function validarEmail(email) {
  // Expressão regular para validar o formato do email
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}