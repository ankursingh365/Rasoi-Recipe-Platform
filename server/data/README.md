# Seed data

- `recipes.json.gz`: 5,909 cleaned recipes, loaded by `npm run seed`
- `ingredients.json.gz`: 1,419 ingredients with Hindi and regional aliases (used from step 14)

## Source and licence

Derived from the **6000+ Indian Food Recipes Dataset** by Kanishka Jain
([Mendeley Data, DOI 10.17632/xsphgmmh7b.1](https://data.mendeley.com/datasets/xsphgmmh7b/1)),
which was compiled from [Archana's Kitchen](https://www.archanaskitchen.com/).
The dataset is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
so these derived files are shared under the same licence. Every recipe keeps a
`source.url` link back to its original page.

## How the data was cleaned

- Dropped rows whose "translated" columns were still in Hindi, and duplicates
- Removed the trailing "Recipe" from titles and split out subtitles
- Parsed every ingredient line into quantity, unit, name and note, plus a normalised `key`
  (so "Green Chillies" and "green chilli" match)
- Grouped instruction sentences into readable steps
- Mapped messy cuisine and course labels to fixed lists, and added a `region`
- Re-derived each diet from the ingredients (a "vegetarian" cake with eggs becomes eggetarian)
- Gave each dish a colour `tone` from its main ingredients