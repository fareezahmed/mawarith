# Transliteration and citation style

One scheme for every page of Al-Mawārīth (`mcalc/`). It follows the conventions the site already used most, so new text should match it.

## Letters

| Arabic | Write | Example |
|---|---|---|
| ع (ʿayn) | ʿ (U+02BF) | ʿawl, ʿaṣabah, taʿṣīb |
| ء (hamza) | ʾ (U+02BE), omitted at the start of a word | farāʾiḍ, Qurʾān |
| long vowels | ā ī ū | Mawārīth, Ḥanafī |
| ح ص ض ط ظ | ḥ ṣ ḍ ṭ ẓ | ḥijb, waṣiyyah, farāʾiḍ |
| ث ذ ش خ غ | th dh sh kh gh | Thābit, dhawū, Shāfiʿī |
| ى (alif maqṣūrah) | ā | fatwā, khunthā |

Never use a straight or curly apostrophe for ʿayn or hamza (not `'awl`, `Qur'an`, `Fara'id`).

## Endings and articles

- **Tāʾ marbūṭah** is written **-ah** on its own: jihah, darajah, ʿaṣabah, waṣiyyah, kalālah, al-Mushtarakah, muʿāddah.
- In a construct phrase (iḍāfah) it is **-at**: quwwat al-qarābah.
- The article is **al-**, joined with a hyphen and never assimilated: al-Nisāʾ, al-Tirmidhī. After a preposition: bi-l-ghayr, wa-l-ikhwah.

## Capitals

Technical terms are lower case in running text and italicised on the static pages: *farāʾiḍ*, *ʿawl*, *radd*, *taʿṣīb*. Capitalise them only at the start of a sentence, in a heading or label, or inside a book title (Kitāb al-Farāʾiḍ). Schools, people and the brand are always capitalised: Ḥanafī, Zayd ibn Thābit, Al-Mawārīth. Allah and Sharīʿah keep these spellings.

## Not changed by this scheme

- Code identifiers, storage keys and file names (`hanafi`, `tashrik`, `mawarith:madhhab`, `mawarith-inheritance-report.pdf`).
- Names of living people as they spell them (for example on the About page).
- The PDF export, which folds marks to plain letters on its own because its built-in fonts lack them.

## Honorifics and citations

- Every mention of a Companion is followed by **(رضي الله عنه)**, or **(رضي الله عنها)** for a woman. Each name gets its own honorific, including in lists, and possessives are reworded (“the method of Zayd ibn Thābit (رضي الله عنه)”, not “Zayd ibn Thābit’s method”). On static pages wrap it in `<span class="honorific" lang="ar">…</span>`.
- Every source reference is shown in brackets, references separated by semicolons: (Ṣaḥīḥ al-Bukhārī 2742; Ṣaḥīḥ Muslim 1628). In the calculator, write evidence `src` values without brackets: the renderer adds them.
