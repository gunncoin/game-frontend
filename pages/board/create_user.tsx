import type { NextPage } from 'next'
import { useEffect, useState } from 'react'

import styles from '../../styles/Home.module.css'
import { API_URL } from '../../utils/game/constants'

const CreateUser: NextPage = () => {
  const [userID, setUserID] = useState<string | null>()

  useEffect(() => {
    ;(async () => {
      const generatedID = await (
        await fetch(`${API_URL}/board/users/create`, {
          method: 'POST',
        })
      ).text()
      setUserID(generatedID)
      localStorage.setItem('login', generatedID)
    })()
  }, [])

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Creating a user...</h1>

        <p className={styles.description}>
          User ID: <br />
          {userID ?? '[...]'} <br />
          {userID && (
            <>
              Make sure to copy this down <br />
              <a style={{ color: '#0070f3' }} href="/board">
                Proceed to the game!
              </a>
            </>
          )}
        </p>
      </main>
    </div>
  )
}

export default CreateUser
