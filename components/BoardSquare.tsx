import { Position } from '../pages/board'
import { Player } from '../utils/game/types'

interface BoardSquareProps {
  owner?: Player
  value: number
  position: Position
  onClick: (pos: Position, owner?: Player) => () => Promise<void>
  selected: boolean
}

const BoardSquare = (props: BoardSquareProps) => {
  const { owner, value, position, onClick, selected } = props
  return (
    <div
      style={{
        minWidth: '4rem',
        textAlign: 'center',
        height: '4rem',
        backgroundColor: owner?.color,
        borderRadius: '1rem',
        borderStyle: 'solid',
        borderColor: selected ? 'gold' : 'white',
        borderWidth: '2px',
        color: 'white',
        fontSize: '25px',
        lineHeight: '3.4rem',
      }}
      onClick={onClick(position, owner)}
    >
      {value}
    </div>
  )
}

export default BoardSquare
