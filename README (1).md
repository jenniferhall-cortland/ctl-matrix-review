# CTL Matrix Review

An anonymous rating form for the SUNY Cortland Center for Teaching and Learning advisory committee. It uses *A Center for Teaching and Learning Matrix* (ACE and POD Network, 2018). Members rate the CTL from their own phones or laptops, and a results screen shows averages for everyone and for administrators, faculty, and staff, updating as responses arrive.

**Files**

- `index.html`: the whole site (form, results screen, Excel export)
- `Code.gs`: the Google Apps Script that stores responses in a Google Sheet

## How it works

1. **Rate the CTL** (`…/#rate`): a respondent picks the academic year (2025–26 through 2030–31), their role (Administrator, Faculty, or Staff), and their school or office. They then rate the 17 areas one at a time, with an optional comment on each, review their answers, and submit. Answers are saved on the device as they go, so a refresh doesn't lose them.
2. **Results** (`…/#results`): averages for each domain and each area, for all respondents and by role. An area is flagged when role averages differ by 1.0 point or more (**Roles differ**) or when ratings run from 1 to 3 (**Wide spread**). Also shows response counts by school or office, and the comments.
3. **Second screen**: on Results, **Open on a second screen** opens a version without menus for the projector. It checks for new responses every 20 seconds.
4. **Download Excel**: a workbook with Summary, Area results, Responses, Comments, and Rubric text sheets for the selected year.

## One-time setup: connect the Google Sheet (about 10 minutes)

Until you do this, the page runs in **test mode**: responses are saved only in the browser where they were entered, and a black bar says so at the top.

1. In Google Drive, create a blank Google Sheet named, for example, *CTL Matrix Review Responses*.
2. In the sheet, choose **Extensions → Apps Script**. Delete the starter code, paste in all of `Code.gs`, and click **Save**.
3. In the function menu at the top, choose `setup` and click **Run**. Approve the permissions. This creates the *Responses* tab.
4. Click **Deploy → New deployment**. Click the gear icon, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. In `index.html`, find `var API_URL = '';` near the top of the script and paste the URL between the quotes. Commit the change.

To test before committing, add `?api=` plus the URL to the page address, for example `https://<you>.github.io/<repo>/?api=https://script.google.com/macros/s/…/exec`.

**Notes**

- If your campus Google account won't allow **Anyone** access, use a personal Google account for the sheet. The data is anonymous ratings.
- If you edit `Code.gs` later, go to **Deploy → Manage deployments → Edit**, choose **New version**, and click **Deploy**. The URL stays the same.
- The sheet is the master copy of the data. You can delete test rows from it directly.
- Anyone with the page link can submit a response and see the results, including comments. Share the link only with the committee.

## Publish on GitHub Pages

1. Create a repository and upload `index.html`, `Code.gs`, and this README.
2. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
3. After a minute or two, the site is at `https://<your-username>.github.io/<repo-name>/`. Send members that link. Use `…/#results` for the results screen.

## Settings in index.html

At the top of the script:

- `API_URL`: the Google Sheet web app URL
- `YEARS`: the academic-year dropdown
- `SCHOOLS`: suggestions for the school or office field (people can still type any office)
- `REFRESH_SECONDS`: how often the results screen checks for new responses
- `ROLE_GAP_FLAG`: how far apart role averages must be to flag an area (default 1.0)

If you add years, add the same years to `YEARS` in `Code.gs` and redeploy.

## How results are calculated

- Averages use ratings of 1, 2, and 3 only. IE (insufficient evidence) and N/A (outside the agreed scope) are counted separately.
- A domain average is the average of its area averages, so each area counts equally.
- Role results use only that role's responses. With small numbers, one person can move a role's average a lot, so check the n shown next to each average.

## Rubric text and license

The level descriptions, domain introductions, and the note on reach are copied word for word from *A Center for Teaching and Learning Matrix* (2018), a collaboration of the American Council on Education and the POD Network. They are used under the Creative Commons Attribution-NonCommercial International License that ACE and the POD Network grant for the matrix. Original: https://podnetwork.org/content/uploads/ACE-POD-Teaching-Center-Matrix-2018.pdf
