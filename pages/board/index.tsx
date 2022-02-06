import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import Router from 'next/router'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import BoardSquare from '../../components/BoardSquare'
import { Player } from '../../utils/game/types'
import { API_URL, WEBSOCKET_URL } from '../../utils/game/constants'
import styles from '../../styles/Home.module.css'

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

  const [player, setPlayer] = useState<Player | null>(null)
  const [fetched, setFetched] = useState(false)

  const { lastMessage } = useWebSocket(WEBSOCKET_URL)

  const setValues = (pos: Position, val: SquareData) => {
    setBoardValues(v => {
      let n = v
      n[pos.y][pos.x] = val
      return n
    })
  }

  const fetchData = async () => {
    const boardConfig = await (await fetch(`${API_URL}/board/config`)).json()
    const newPlayers = await (await fetch(`${API_URL}/board/users`)).json()
    const newBoard = await (await fetch(`${API_URL}/board`)).json()
    const hashedUser = await (await fetch(`${API_URL}/board/hashed_user?id=${localStorage.getItem('login')}`)).json()

    if (!(hashedUser in newPlayers)) {
      Router.push('/')
    }

    setBoardValues(
      newBoard.map(v =>
        v.map(a => {
          return {
            ...a,
            owner: !!a.owner
              ? {
                  id: a.owner,
                  color: newPlayers[a.owner],
                }
              : null,
          }
        })
      )
    )

    setWidth(boardConfig.width)
    setHeight(boardConfig.height)

    setPlayer({
      id: hashedUser,
      color: newPlayers[hashedUser],
    })

    setFetched(true)
  }

  useEffect(() => {
    if (!lastMessage?.data) return
    const data = JSON.parse(lastMessage.data)
    setBoardValues(
      data.board.map(v =>
        v.map(a => {
          return {
            ...a,
            owner: !!a.owner
              ? {
                  id: a.owner,
                  color: data.users[a.owner],
                }
              : null,
          }
        })
      )
    )
  }, [lastMessage])

  useEffect(() => {
    ;(async () => {
      await fetchData()
    })()
  }, [])

  const publishChange = async (pos: Position) => {
    await fetch(
      `${API_URL}/board/move?start=${selected.pos.y},${selected.pos.x}&end=${pos.y},${pos.x}&id=${localStorage.getItem(
        'login'
      )}`,
      {
        method: 'POST',
      }
    )
  }

  const onClick = (pos: Position, owner?: Player) => {
    return async () => {
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
              await publishChange(pos)
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
                await publishChange(pos)
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
            await publishChange(pos)
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

  if (!fetched) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Loading the board...</h1>
        </main>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <h1 style={{ color: player?.color }}>Your Color: </h1>
        <div
          style={{
            width: '4rem',
            textAlign: 'center',
            height: '4rem',
            backgroundColor: player?.color,
            borderRadius: '1rem',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: '2px',
            color: 'white',
            fontSize: '25px',
            lineHeight: '3.4rem',
            marginLeft: '1.5%',
          }}
        />
      </div>
      <div style={{ width: '100%' }}>
        {Array.from(Array(boardHeight).keys()).map(y => (
          <div style={{ display: 'flex', flexDirection: 'row', minWidth: '100%' }}>
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
    </div>
  )
}

export default Home
