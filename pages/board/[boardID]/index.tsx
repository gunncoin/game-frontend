import type { NextPage } from 'next'
import { useState, useEffect } from 'react'

import BoardSquare from '../../../components/BoardSquare'
import { Player } from '../../../utils/game/types'

export interface Position {
  x: number
  y: number
}

interface Selected {
  pos: Position
  owner?: Player
}

interface SquareData {
  val: number
  owner?: Player
}

const Home: NextPage = () => {
  const [boardWidth, setWidth] = useState(8)
  const [boardHeight, setHeight] = useState(8)
  const [boardValues, setBoardValues] = useState<SquareData[][]>(
    Array.from(Array(boardHeight).keys()).map(_ =>
      Array.from(Array(boardWidth).keys()).map(_ => {
        return { val: 0, owner: undefined } as SquareData
      })
    )
  )

  const [selected, setSelected] = useState<Selected | null>(null)

  const [player, setPlayer] = useState<Player | null>({ id: 1000, color: '#332222' })

  const setValues = (pos: Position, val: SquareData) => {
    setBoardValues(v => {
      let n = v
      n[pos.y][pos.x] = val
      return n
    })
  }

  useEffect(() => {
    setValues({ x: 0, y: 0 }, { val: 2, owner: player })
    setValues({ x: 0, y: 1 }, { val: 2, owner: null })
    setValues({ x: 0, y: 2 }, { val: 2, owner: { id: 1, color: '#550000' } })
    setValues({ x: 1, y: 2 }, { val: 1, owner: { id: 1, color: '#550000' } })
  }, [])

  const onClick = (pos: Position, owner?: Player) => {
    return () => {
      if (!selected) {
        // If nothing is selected, select what the user clicked on
        setSelected({ pos, owner })
      } else {
        if (
          ((pos.x == selected.pos.x + 1 || pos.x == selected.pos.x - 1) && pos.y == selected.pos.y) ||
          ((pos.y == selected.pos.y + 1 || pos.y == selected.pos.y - 1) && pos.x == selected.pos.x)
        ) {
          // If what the player click is adjecent to the selected square then expand to that
          const selectedValue = boardValues[selected.pos.y][selected.pos.x].val
          const clickedValue = boardValues[pos.y][pos.x].val

          if (player.id == selected.owner?.id && selectedValue > 1) {
            if (!owner || player.id == owner?.id) {
              // If it is unowned or owned by the person already then combine the scores
              setValues(pos, {
                val: Math.floor(selectedValue / 2) + clickedValue,
                owner: player,
              })
              setValues(selected.pos, {
                val: Math.ceil(selectedValue / 2),
                owner: player,
              })
              setSelected(null)
            } else {
              // If it is owned by another player check if they can capture it and capture it if they can
              if (selectedValue > clickedValue) {
                // If they can capture it then do so
                setValues(pos, {
                  val: 0,
                  owner: null,
                })
                setValues(selected.pos, {
                  val: selectedValue - clickedValue,
                  owner: player,
                })
                setSelected(null)
              }
            }
          } else if (player.id == selected.owner?.id && player.id == owner?.id && selectedValue == 1) {
            // If the player moved a 1 to their own square let them
            setValues(pos, {
              val: 1 + clickedValue,
              owner: player,
            })
            setValues(selected.pos, {
              val: 0,
              owner: null,
            })
            setSelected(null)
          } else {
            // If the player does not own the selected square then just select the square as normal
            setSelected({ pos, owner })
          }
        } else {
          if (pos.x == selected.pos.x && pos.y == selected.pos.y) {
            // If the player clicked on the selected square deselect it
            setSelected(null)
          } else {
            // Otherwise, just select the thing the player clicked on
            setSelected({ pos, owner })
          }
        }
      }
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {Array.from(Array(boardHeight).keys()).map(y => (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          {Array.from(Array(boardWidth).keys()).map(x => (
            <BoardSquare
              value={boardValues[y][x].val}
              position={{ x: x, y: y }}
              onClick={onClick}
              selected={selected && x == selected.pos.x && y == selected.pos.y}
              owner={boardValues[y][x].owner}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Home
