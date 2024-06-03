
'use strict' //modo estrito


/**
 * Essa constante retorna a URL do App sem nenhum nome de arquivo.
 * A expressão regular /\/[^\/]*$/ captura a barra (/) seguida por qualquer caractere que não seja uma barra zero ou mais vezes até o 
 * final da string, que é o nome do arquivo na URL. O método replace() substitui esse trecho da string por uma string vazia, removendo o nome do arquivo da URL.
 * Por exemplo, se a URL atual for https://www.exemplo.com.br/pasta/subpasta/arquivo.html, 
 * o valor retornado será https://www.exemplo.com.br/pasta/subpasta.
'use strict'; // modo estrito

/**
 * @const {string}
 */
const urlApp = window.location.href.replace(/\/[^\/]*$/, '');

/**
 * novoUsuario.
 * Cria um novo usuário no Firebase.
 * @param {string} nome Nome do usuário
 * @param {string} email e-mail do usuário
 * @param {string} senha Senha do usuário
 * @param {string} privilegio Privilégio do usuário
 * @param {string} cpf CPF do usuário
 * @param {string} turma Turma do usuário
 * @param {number} nota1 Primeira nota do usuário
 * @param {number} nota2 Segunda nota do usuário
 * @param {number} nota3 Terceira nota do usuário
 * @param {number} nota4 Quarta nota do usuário
 * @param {string} nascimento Data de nascimento do usuário
 * @param {string} sexo Sexo do usuário
 * @return {object} O usuário criado
 */
function novoUsuario(nome, email, senha, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, senha)
    .then((result) => {
      // Salva o privilegio no banco de dados em tempo real
      salvaDadosUsuario(result.user.uid, nome, email, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo);

      // Atualiza o perfil do usuário com o nome
      result.user.updateProfile({
        displayName: nome
      }).then(() => {
        console.log(`Usuário Logado: ${JSON.stringify(result.user)}`);
        window.location.href = `${urlApp}/home.html`; // Direcionamos o usuário para a tela inicial
      }).catch((error) => {
        console.error(error.message);
        alerta(`Erro: Não foi possível atualizar o nome do usuário <br> ${error.message}`, 'danger');
      });
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      alerta(`Erro: Não foi possível cadastrar o usuário <br> ${errors[error.code]}`, 'danger');
    });
}

function novoUsuarioADM(nome, email, senha, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, senha)
    .then((result) => {
      // Salva o privilegio no banco de dados em tempo real
      salvaDadosUsuario(result.user.uid, nome, email, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo);

      // Atualiza o perfil do usuário com o nome
      result.user.updateProfile({
        displayName: nome
      }).then(() => {
        console.log(`Usuário Logado: ${JSON.stringify(result.user)}`);
        window.location.href = `${urlApp}/home.html`; // Direcionamos o usuário para a tela inicial
      }).catch((error) => {
        console.error(error.message);
        alerta(`Erro: Não foi possível atualizar o nome do usuário <br> ${error.message}`, 'danger');
      });
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      alerta(`Erro: Não foi possível cadastrar o usuário <br> ${errors[error.code]}`, 'danger');
    });
}

function editaUsuarioADM(uid, nome, email, senha, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo) {
  const user = firebase.auth().currentUser;

  if (user) {
    user.updateEmail(email)
      .then(() => user.updatePassword(senha))
      .then(() => user.updateProfile({ displayName: nome }))
      .then(() => {
        // Atualiza o banco de dados em tempo real com os novos dados do usuário
        return firebase.database().ref('usuarios/' + uid).update({
          nome: nome,
          email: email,
          privilegio: privilegio,
          cpf: cpf,
          turma: turma,
          notas: {
            nota1: nota1,
            nota2: nota2,
            nota3: nota3,
            nota4: nota4
          },
          nascimento: nascimento,
          sexo: sexo
        });
      })
      .then(() => {
        console.log('Usuário editado com sucesso!');
        window.location.href = `${urlApp}/home.html`; // Redireciona o usuário para a tela inicial
      })
      .catch((error) => {
        console.error(error.message);
        alerta(`Erro: Não foi possível editar o usuário <br> ${error.message}`, 'danger');
      });
  } else {
    alerta('Erro: Usuário não autenticado', 'danger');
  }
}




/**
 * loginFirebase.
 * Realiza a autenticação do usuário no Firebase.
 * @param {string} email e-mail do usuário
 * @param {string} senha Senha do usuário
 * @return {object} O usuário logado
 */
function loginFirebase(email, senha) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, senha)
    .then(result => {
      console.log(result.user);
      window.location.href = `${urlApp}/home.html`;
    })
    .catch(error => {
      console.error(error.code);
      alerta(`Erro: Não foi possível efetuar o login <br> ${errors[error.code]}`, 'danger');
    });
}



/**
 * logoutFirebase.
 * Realiza o logout do usuário no Firebase.
 * @return {null} Redireciona o usuário para o login
 */
function logoutFirebase() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      window.location.href = `${urlApp}/`;
      localStorage.removeItem('usuarioId'); //Remove o id do usuário atual no Local Storage
    })
    .catch(function (error) {
      alerta(`Erro: Não foi possível efetuar o logout <br> ${errors[error.code]}`, 'danger');
    });



}

function atualizarNomeUsuario(nome) {
  const elementos = document.querySelectorAll('.user-name');
  elementos.forEach(elemento => {
    elemento.textContent = nome;
  });
}


/**
 * verificaLogado.
 * Verifica se o usuário deve ter acesso a página que será carregada
 * @return {null} Caso não esteja logado, redireciona para o início
 */
function verificaLogado() {
  firebase
    .auth()
    .onAuthStateChanged(user => {
      if (user) {
        // Salva o id do usuário atual no Local Storage
        localStorage.setItem('usuarioId', user.uid);

        // Recupere os dados do usuário do banco de dados
        firebase.database().ref('clientes/' + user.uid).once('value').then(snapshot => {
          const cliente = snapshot.val();
          const nome = cliente ? cliente.usuario : 'Desconhecido';
          const privilegio = cliente ? cliente.privilegio : 'Desconhecido';
          const email = cliente ? cliente.email : 'Desconhecido';
          const turma = cliente ? cliente.turma : 'Desconhecido';
          const cpf = cliente ? cliente.cpf : 'Desconhecido';
          const nota1 = cliente ? cliente.nota1 : 'Desconhecido';
          const nota2 = cliente ? cliente.nota2 : 'Desconhecido';
          const nota3 = cliente ? cliente.nota3 : 'Desconhecido';
          const nota4 = cliente ? cliente.nota4 : 'Desconhecido';
          const nascimento = cliente ? cliente.nascimento : 'Desconhecido';
          const sexo = cliente ? cliente.sexo : 'Desconhecido';

          // Atualiza todos os elementos que precisam exibir o nome do usuário
          atualizarNomeUsuario(nome);

          // Exibe o privilégio no HTML
          document.getElementById('user-privilege').textContent = privilegio;

          // Exibe o email no HTML
          document.getElementById('user-email_senha').value = email;

          document.getElementById('user-email').textContent = email;


  
          // Obtém os elementos que devem ser exibidos para administradores
          const elementosDocente = document.querySelectorAll('.privilegio-docente');

          // Exibe os elementos se o privilégio for "administrador"
          if ((privilegio === 'docente') || (privilegio === 'administrador')) {

            elementosDocente.forEach(elemento => elemento.style.display = 'block');

          } else {

            elementosDocente.forEach(elemento => elemento.style.display = 'none');
          }

          // Obtém os elementos que devem ser exibidos para administradores
          const elementosAdministrador = document.querySelectorAll('.privilegio-administrador');

          // Exibe os elementos se o privilégio for "administrador"
          if (privilegio === 'administrador') {
            elementosAdministrador.forEach(elemento => elemento.style.display = 'block');
          } else {
            elementosAdministrador.forEach(elemento => elemento.style.display = 'none');
          }

          // Salva os dados do usuário logado na collection clientes (se necessário)
          salvaDadosUsuario(user.uid, nome, email, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo);

          // Atualiza o contador de usuários logados
          contarUsuarios('clientes');
        });
      } else {
        console.error('Usuário não logado. Redirecionando...');
        window.location.href = `${urlApp}/`;
      }
    });
}

/**
 * Verifica o privilégio do usuário logado e redireciona para a página apropriada
 * @param {string} page - Página atual que o usuário está tentando acessar
 */
function verificaAcesso(page) {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      firebase.database().ref('clientes/' + user.uid).once('value').then(snapshot => {
        const cliente = snapshot.val();
        const privilegio = cliente ? cliente.privilegio : 'Desconhecido';

        // Mapeamento de privilégios para páginas
        const acesso = {
          'administrador': ['usuarios.html', 'clientes.html', 'home.html', 'docentes.html'],
          'docente': ['clientes.html', 'home.html'],
          'aluno': ['home.html']
        };

        if (privilegio in acesso && acesso[privilegio].includes(page)) {
          // O usuário tem acesso à página atual
          return;
        } else {
          // O usuário não tem acesso à página atual, redireciona para acesso negado
          console.error('Acesso negado. Redirecionando para a página de acesso negado...');
          window.location.href = `${urlApp}/acesso-negado.html`;
        }
      });
    } else {
      console.error('Usuário não logado. Redirecionando...');
      window.location.href = `${urlApp}/`;
    }
  });
}

// Uso da função para verificar acesso ao carregar a página
const paginaAtual = window.location.pathname.split('/').pop(); // Obtém o nome da página atual




function enviarEmailRedefinicaoAuto() {
  const email = document.getElementById('user-email_senha').value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alerta2('✅ Email de redefinição de senha enviado com sucesso!', 'success');
      $('#bd-senha-auto-modal-lg').modal('hide');
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      alerta2('❌ Falha ao enviar email de redefinição de senha: ' + error.message, 'danger');
    });
}

function enviarEmailRedefinicaoEsqueceu() {
  const email = document.getElementById('user-email_senha_esqueceu').value;

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alerta('✅ Email de redefinição de senha enviado com sucesso!', 'success');
      $('#bd-esqueceu-modal').modal('hide');
    })
    .catch((error) => {
      console.error(error.code);
      console.error(error.message);
      alerta('❌ Falha ao enviar email de redefinição de senha: ' + error.message, 'danger');
    });
}




function salvaDadosUsuario(id, nome, email, privilegio, cpf, turma, nota1, nota2, nota3, nota4, nascimento, sexo) {
  firebase.database().ref('clientes/' + id).set({
    usuario: nome,
    email: email,
    privilegio: privilegio,
    cpf: cpf,
    turma: turma,
    nota1: nota1,
    nota2: nota2,
    nota3: nota3,
    nota4: nota4,
    nascimento: nascimento,
    sexo: sexo,
    ultimoAcesso: new Date().toISOString()
  });
}


/**
 * contarUsuarios
 * Retornar a contagem do total de registros com privilégio igual a "Aguardando aprovação" na collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @return {null}
 */
function contarUsuarios(collection) {
  firebase.database().ref(collection).on('value', (snap) => {
    let contadorUsuarios = 0;
    snap.forEach((item) => {
      if (item.val().privilegio === 'Aguardando aprovação') {
        contadorUsuarios++;
      }
    });
    document.getElementById('totalUsuarios').innerHTML = contadorUsuarios;
  });
}

// Chame a função com o nome da collection apropriada
document.addEventListener('DOMContentLoaded', (event) => {
  contarUsuarios('clientes');
});




/**
 * errors.
 * Constante com a tradução em pt-BR dos principais erros de autenticação
 **/
const errors = {
  'auth/app-deleted': 'O banco de dados não foi localizado.',
  'auth/expired-action-code': 'O código da ação o ou link expirou.',
  'auth/invalid-action-code': 'O código da ação é inválido. Isso pode acontecer se o código estiver malformado ou já tiver sido usado.',
  'auth/user-disabled': 'O usuário correspondente à credencial fornecida foi desativado.',
  'auth/user-not-found': 'O usuário não correponde à nenhuma credencial.',
  'auth/weak-password': 'A senha é muito fraca.',
  'auth/email-already-in-use': 'Já existi uma conta com o endereço de email fornecido.',
  'auth/invalid-email': 'O endereço de e-mail não é válido.',
  'auth/operation-not-allowed': 'O tipo de conta correspondente à esta credencial, ainda não encontra-se ativada.',
  'auth/account-exists-with-different-credential': 'E-mail já associado a outra conta.',
  'auth/auth-domain-config-required': 'A configuração para autenticação não foi fornecida.',
  'auth/credential-already-in-use': 'Já existe uma conta para esta credencial.',
  'auth/operation-not-supported-in-this-environment': 'Esta operação não é suportada no ambiente que está sendo executada. Verifique se deve ser http ou https.',
  'auth/timeout': 'Excedido o tempo de resposta. O domínio pode não estar autorizado para realizar operações.',
  'auth/missing-android-pkg-name': 'Deve ser fornecido um nome de pacote para instalação do aplicativo Android.',
  'auth/missing-continue-uri': 'A próxima URL deve ser fornecida na solicitação.',
  'auth/missing-ios-bundle-id': 'Deve ser fornecido um nome de pacote para instalação do aplicativo iOS.',
  'auth/invalid-continue-uri': 'A próxima URL fornecida na solicitação é inválida.',
  'auth/unauthorized-continue-uri': 'O domínio da próxima URL não está na lista de autorizações.',
  'auth/invalid-dynamic-link-domain': 'O domínio de link dinâmico fornecido, não está autorizado ou configurado no projeto atual.',
  'auth/argument-error': 'Verifique a configuração de link para o aplicativo.',
  'auth/invalid-persistence-type': 'O tipo especificado para a persistência dos dados é inválido.',
  'auth/unsupported-persistence-type': 'O ambiente atual não suportar o tipo especificado para persistência dos dados.',
  'auth/invalid-credential': 'A credencial expirou ou está mal formada.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-verification-code': 'O código de verificação da credencial não é válido.',
  'auth/invalid-verification-id': 'O ID de verificação da credencial não é válido.',
  'auth/custom-token-mismatch': 'O token está diferente do padrão solicitado.',
  'auth/invalid-custom-token': 'O token fornecido não é válido.',
  'auth/captcha-check-failed': 'O token de resposta do reCAPTCHA não é válido, expirou ou o domínio não é permitido.',
  'auth/invalid-phone-number': 'O número de telefone está em um formato inválido (padrão E.164).',
  'auth/missing-phone-number': 'O número de telefone é requerido.',
  'auth/quota-exceeded': 'A cota de SMS foi excedida.',
  'auth/cancelled-popup-request': 'Somente uma solicitação de janela pop-up é permitida de uma só vez.',
  'auth/popup-blocked': 'A janela pop-up foi bloqueado pelo navegador.',
  'auth/popup-closed-by-user': 'A janela pop-up foi fechada pelo usuário sem concluir o login no provedor.',
  'auth/unauthorized-domain': 'O domínio do aplicativo não está autorizado para realizar operações.',
  'auth/invalid-user-token': 'O usuário atual não foi identificado.',
  'auth/user-token-expired': 'O token do usuário atual expirou.',
  'auth/null-user': 'O usuário atual é nulo.',
  'auth/app-not-authorized': 'Aplicação não autorizada para autenticar com a chave informada.',
  'auth/invalid-api-key': 'A chave da API fornecida é inválida.',
  'auth/network-request-failed': 'Falha de conexão com a rede.',
  'auth/requires-recent-login': 'O último horário de acesso do usuário não atende ao limite de segurança.',
  'auth/too-many-requests': 'As solicitações foram bloqueadas devido a atividades incomuns. Tente novamente depois que algum tempo.',
  'auth/web-storage-unsupported': 'O navegador não suporta armazenamento ou se o usuário desativou este recurso.',
  'auth/invalid-claims': 'Os atributos de cadastro personalizado são inválidos.',
  'auth/claims-too-large': 'O tamanho da requisição excede o tamanho máximo permitido de 1 Megabyte.',
  'auth/id-token-expired': 'O token informado expirou.',
  'auth/id-token-revoked': 'O token informado perdeu a validade.',
  'auth/invalid-argument': 'Um argumento inválido foi fornecido a um método.',
  'auth/invalid-creation-time': 'O horário da criação precisa ser uma data UTC válida.',
  'auth/invalid-disabled-field': 'A propriedade para usuário desabilitado é inválida.',
  'auth/invalid-display-name': 'O nome do usuário é inválido.',
  'auth/invalid-email-verified': 'O e-mail é inválido.',
  'auth/invalid-hash-algorithm': 'O algoritmo de HASH não é uma criptografia compatível.',
  'auth/invalid-hash-block-size': 'O tamanho do bloco de HASH não é válido.',
  'auth/invalid-hash-derived-key-length': 'O tamanho da chave derivada do HASH não é válido.',
  'auth/invalid-hash-key': 'A chave de HASH precisa ter um buffer de byte válido.',
  'auth/invalid-hash-memory-cost': 'O custo da memória HASH não é válido.',
  'auth/invalid-hash-parallelization': 'O carregamento em paralelo do HASH não é válido.',
  'auth/invalid-hash-rounds': 'O arredondamento de HASH não é válido.',
  'auth/invalid-hash-salt-separator': 'O campo do separador de SALT do algoritmo de geração de HASH precisa ser um buffer de byte válido.',
  'auth/invalid-id-token': 'O código do token informado não é válido.',
  'auth/invalid-last-sign-in-time': 'O último horário de login precisa ser uma data UTC válida.',
  'auth/invalid-page-token': 'A próxima URL fornecida na solicitação é inválida.',
  'auth/invalid-password': 'A senha é inválida, precisa ter pelo menos 6 caracteres.',
  'auth/invalid-password-hash': 'O HASH da senha não é válida.',
  'auth/invalid-password-salt': 'O SALT da senha não é válido.',
  'auth/invalid-photo-url': 'A URL da foto de usuário é inválido.',
  'auth/invalid-provider-id': 'O identificador de provedor não é compatível.',
  'auth/invalid-session-cookie-duration': 'A duração do COOKIE da sessão precisa ser um número válido em milissegundos, entre 5 minutos e 2 semanas.',
  'auth/invalid-uid': 'O identificador fornecido deve ter no máximo 128 caracteres.',
  'auth/invalid-user-import': 'O registro do usuário a ser importado não é válido.',
  'auth/invalid-provider-data': 'O provedor de dados não é válido.',
  'auth/maximum-user-count-exceeded': 'O número máximo permitido de usuários a serem importados foi excedido.',
  'auth/missing-hash-algorithm': 'É necessário fornecer o algoritmo de geração de HASH e seus parâmetros para importar usuários.',
  'auth/missing-uid': 'Um identificador é necessário para a operação atual.',
  'auth/reserved-claims': 'Uma ou mais propriedades personalizadas fornecidas usaram palavras reservadas.',
  'auth/session-cookie-revoked': 'O COOKIE da sessão perdeu a validade.',
  'auth/uid-alread-exists': 'O indentificador fornecido já está em uso.',
  'auth/email-already-exists': 'O e-mail fornecido já está em uso.',
  'auth/phone-number-already-exists': 'O telefone fornecido já está em uso.',
  'auth/project-not-found': 'Nenhum projeto foi encontrado.',
  'auth/insufficient-permission': 'A credencial utilizada não tem permissão para acessar o recurso solicitado.',
  'auth/internal-error': 'O servidor de autenticação encontrou um erro inesperado ao tentar processar a solicitação.'
}
