import Modal from './Modal.jsx';

const SHORTCUTS = [
  ['Espaço', 'Começa o sorteio'],
  ['F', 'Tela cheia'],
  ['R', 'Embaralha a lista'],
  ['S', 'Liga e desliga o som'],
  ['M', 'Troca o modo do sorteio'],
  ['Esc', 'Fecha janelas e cancela o sorteio'],
];

export default function HelpModal({ open, onClose }) {
  return (
    <Modal open={open} title="Como usar" subtitle="Três passos e a turma já está sorteando." onClose={onClose} size="lg">
      <ol className="steps">
        <li>
          <strong>Cadastre a turma.</strong> Digite nome por nome ou use “Colar lista” para jogar a chamada inteira de
          uma vez. Vale nome, número, emoji, código ou combinação como “🚀 Grupo A”.
        </li>
        <li>
          <strong>Escolha o tipo.</strong> <em>Vencedor único</em> sorteia um nome por vez. <em>Classificação</em>{' '}
          sorteia a ordem inteira de uma vez, do 1º ao último colocado — serve tanto para pódio de campeonato quanto
          para definir a ordem das equipes num trabalho. O modo (game show, hacker, foguete, caos), o tema e a duração
          ficam em Configurações.
        </li>
        <li>
          <strong>Aperte SORTEAR.</strong> O resultado é definido antes da animação, com{' '}
          <code>crypto.getRandomValues()</code>. A encenação só revela o que já foi decidido.
        </li>
      </ol>

      <h3 className="help__title">Atalhos de teclado</h3>
      <ul className="shortcuts">
        {SHORTCUTS.map(([key, description]) => (
          <li key={key}>
            <kbd>{key}</kbd>
            <span>{description}</span>
          </li>
        ))}
      </ul>

      <p className="help__note">
        Tudo fica salvo neste navegador: participantes, histórico, configurações e quem já foi sorteado. Nada é enviado
        para servidor nenhum, e depois de carregada a página funciona sem internet.
      </p>
      <p className="help__note help__note--dim">Dizem que existe um código secreto de videogame escondido por aqui.</p>
    </Modal>
  );
}
