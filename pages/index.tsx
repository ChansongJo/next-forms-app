import { useState } from 'react'

import Link from 'next/link'
import { FormEvent } from 'react'
import styles from '../styles/Home.module.css'

export default function PageWithJSbasedForm() {
  const [data, setData] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)


  // Handle the submit event on form submit.
  const handleSubmit = async (event: FormEvent) => {
    setLoading(true)
    setData(['LOADING...'])

    // Stop the form from submitting and refreshing the page.
    event.preventDefault()

    // Cast the event target to an html form
    const form = event.target as HTMLFormElement
    const targetUrl = form.url.value as string


    // Get data from the form.
    const data = {
      url: targetUrl,
      runPuppeteer: targetUrl.toLowerCase().includes("kbs")
    }

    // Send the form data to our API and get a response.
    const response = await fetch('/api/parser', {
      // Body of the request is the JSON data we created above.
      body: JSON.stringify(data),
      // Tell the server we're sending JSON.
      headers: {
        'Content-Type': 'application/json',
      },
      // The method is POST because we are sending data.
      method: 'POST',
    })

    // Get the response data from server as JSON.
    // If server returns the name submitted, that means the form works.
    const { data: resData } = await response.json()

    setLoading(false)
    console.log('res', resData)
    setData(resData)
  }
  return (
    <div className="main">
      <h3 className={styles.title}>
        News Header Extractor
      </h3>

      <p className={styles.description}>
        Copy and Paste Url link into the form!
      </p>

      <p className={styles.descriptionSmall}>
        example: {'https://news.sbs.co.kr/news/programMain.do?prog_cd=R1&broad_date=20230122'}
      </p>


      <div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="url">URL link</label>
            <input type="text" id="url" name="url" required />
          </div>
          <div className="form-group">
            <button type="submit" disabled={loading} className={!loading ? styles.active : styles.inactive}>
              {!loading ? 'Submit' : 'Loading'}
            </button>
          </div>
        </form>
        <div>
          <ul>
            {
              data.map((contents) => contents.split(/\n+/))
                .flatMap((textArr) => textArr)
                .filter((text) => text.trim().length > 5)
                .map((text, idx) => <li key={idx}>{text.replace('• ', '').trim()}</li>)
            }
          </ul>
        </div>
      </div>
    </div>
  )
}
