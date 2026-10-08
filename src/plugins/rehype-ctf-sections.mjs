/**
 * rehype-ctf-sections
 *
 * Runs on every Markdown/MDX file whose frontmatter has a `ctf` key (= a write-up).
 * It turns the flat heading structure into nested sections:
 *
 *   ## Challenge           ->  <section class="ctf-challenge">
 *                                <header> h2 + meta badges </header>
 *   ### Step               ->    <section class="ctf-step"> h3 ... </section>
 *   ...                        </section>
 *
 * - The meta badges (category, difficulty, points, solves, author) come from the
 *   frontmatter `challenges` list, matched by `id` or by name.
 * - h2 headings that are not challenges (e.g. "Lời kết") become a plain
 *   <section class="ctf-section">.
 * - A step titled "Flag" gets the extra class `ctf-step--flag`.
 * - Headers and steps get `data-reveal` (fade-in on scroll, src/scripts/reveal.ts).
 *
 * Needs `rehypeHeadingIds` to run before it (see astro.config.mjs).
 */

const normalize = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();

/** Same rules as matchChallenge() in src/lib/ctf.ts. */
function findChallenge(challenges, id, text) {
  return (
    challenges.find((c) => c.id && c.id === id) ??
    challenges.find((c) => normalize(c.name) === normalize(text))
  );
}

function textOf(node) {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(textOf).join('');
  return '';
}

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const txt = (value) => ({ type: 'text', value });

function metaBar(challenge) {
  const items = [
    el('span', { className: ['cat-badge'], dataCat: challenge.category.toLowerCase() }, [txt(challenge.category)]),
  ];
  if (challenge.difficulty) {
    items.push(
      el('span', { className: ['diff-badge'], dataDiff: challenge.difficulty.toLowerCase() }, [txt(challenge.difficulty)]),
    );
  }
  items.push(el('span', { className: ['ctf-meta__item', 'ctf-meta__points'] }, [txt(`${challenge.points} pts`)]));
  if (challenge.solves !== undefined) {
    items.push(el('span', { className: ['ctf-meta__item'] }, [txt(`${challenge.solves} solves`)]));
  }
  if (challenge.author) {
    items.push(el('span', { className: ['ctf-meta__item'] }, [txt(`author: ${challenge.author}`)]));
  }
  return el('div', { className: ['ctf-meta'] }, items);
}

const isHeading = (node, depth) => node.type === 'element' && node.tagName === `h${depth}`;

export default function rehypeCtfSections() {
  return (tree, file) => {
    const frontmatter = file.data.astro?.frontmatter;
    if (!frontmatter || !frontmatter.ctf) return;
    const challenges = Array.isArray(frontmatter.challenges) ? frontmatter.challenges : [];

    const out = [];
    let section = null; // current h2 section
    let step = null; // current h3 section

    for (const node of tree.children) {
      // MDX import/export statements must stay at the top level.
      if (node.type === 'mdxjsEsm') {
        out.push(node);
        continue;
      }

      if (isHeading(node, 2)) {
        const id = String(node.properties?.id ?? '');
        const challenge = findChallenge(challenges, id, textOf(node));
        step = null;
        if (challenge) {
          node.properties.className = ['ctf-challenge__title'];
          section = el('section', { className: ['ctf-challenge'], dataChallenge: id }, [
            el('header', { className: ['ctf-challenge__header'], dataReveal: '' }, [node, metaBar(challenge)]),
          ]);
        } else {
          section = el('section', { className: ['ctf-section'] }, [node]);
        }
        out.push(section);
        continue;
      }

      if (isHeading(node, 3) && section) {
        const isFlag = /^flag\b/i.test(textOf(node).trim());
        step = el('section', { className: isFlag ? ['ctf-step', 'ctf-step--flag'] : ['ctf-step'], dataReveal: '' }, [
          node,
        ]);
        section.children.push(step);
        continue;
      }

      const target = step ?? section;
      if (target) target.children.push(node);
      else out.push(node);
    }

    tree.children = out;
  };
}
