const items = [
  { id: 'pickup', icon: '🥡', name: 'Pick Up Your Food', instead: 'ordering delivery', price: 'A short trip',
    benefit: 'Picking up your food saved you the delivery fee.',
    moment: 'At the pickup counter, you run into an old friend. They ask if you still make those terrible mixtapes. You make them a new one on the walk home, starting with the song they always skipped.' },
  { id: 'transit', icon: '🚇', name: 'Take Public Transit', instead: 'taking a taxi', price: 'A little patience',
    benefit: 'Taking transit gave you a chance to look around while someone else drove.',
    moment: 'A busker on the platform plays a tune you recognize. You hum it into a voice note and send it to your dad. He calls back singing the next line. It’s the song he used to get you to sleep.' },
  { id: 'cook', icon: '🍳', name: 'Cook Your Own Dinner', instead: 'ordering takeout', price: 'Some kitchen work',
    benefit: 'Cooking let you decide exactly how to season your dinner.',
    moment: 'An old cookbook opens to a grocery list with “pears + black pepper” circled. You try the combination on toast. By the time dinner’s ready, you’ve already eaten the experiment.' },
  { id: 'write', icon: '✍️', name: 'Write It Yourself', instead: 'asking AI to write your message', price: 'A little thought',
    benefit: 'Writing your own message gave you practice finding words that sound like you.',
    moment: 'You write a thank-you note and mention how much you loved the crooked blue mug. A week later, a package arrives with the mug inside. The note reads, “I was hoping someone would want it.”' },
  { id: 'read', icon: '📖', name: 'Read the Full Story', instead: 'asking AI to summarize it', price: 'Your time and attention',
    benefit: 'Reading the full story gave you practice following an idea from start to finish.',
    moment: 'Halfway through an article, you spot the name of a bakery you thought had closed. You follow the address and find the same baker working from a stall. She still cuts the corner piece for you.' },
  { id: 'ask', icon: '💬', name: 'Ask a Real Person', instead: 'asking an AI assistant', price: 'A conversation',
    benefit: 'Asking someone gave you a chance to hear their firsthand perspective.',
    moment: 'A stranger draws you a map and marks an X where the neighborhood cat sleeps. You take the longer route and find the cat napping on a sign that says “Please keep moving.”' },
  { id: 'explore', icon: '🗺️', name: 'Explore on Your Own', instead: 'following algorithm-generated recommendations', price: 'A little uncertainty',
    benefit: 'Exploring gave you practice finding your way through unfamiliar streets.',
    moment: 'On an unfamiliar street, a pottery shop has a shelf marked “Free if you can guess what it was meant to be.” You guess a salt cellar. The potter laughs and hands you the world’s shortest vase.' },
  { id: 'tidy', icon: '🧹', name: 'Tidy Up Yourself', instead: 'putting it off', price: 'Some hands-on work',
    benefit: 'Tidying gave you a clearer space and made things easier to find.',
    moment: 'Behind a drawer, you find a photo strip and send it to the group chat. A friend sends back a photo taken from the other side of the booth. Now you know what made everyone laugh: their dad was trying to squeeze in.' },
];

const maxItems = 3;
const screens = ['welcome', 'shop', 'receipt', 'story'];
const steps = document.querySelectorAll('.steps span');
const shelf = document.querySelector('#shelf');
const checkout = document.querySelector('#checkout');
const purchase = document.querySelector('#purchase');
const parcel = document.querySelector('#parcel');
const unwrap = document.querySelector('#unwrap');
const fortuneStatus = document.querySelector('#fortune-status');
let revealTimer;
let pace;
let bag = [];
let purchased = false;

for (const item of items) {
  const card = document.createElement('article');
  card.className = 'card';
  // This markup uses only the fixed catalog above.
  card.innerHTML = `
    <span class="item-icon" aria-hidden="true">${item.icon}</span>
    <h2 id="${item.id}-title">${item.name}</h2>
    <p>Instead of ${item.instead}</p>
    <p>Price: ${item.price}</p>
    <label>
      <input type="checkbox" value="${item.id}" aria-labelledby="${item.id}-add ${item.id}-title">
      <span id="${item.id}-add">Add to bag</span>
    </label>`;
  shelf.append(card);
}

const itemInputs = shelf.querySelectorAll('input');

function updatePace() {
  pace = document.querySelector('input[name="pace"]:checked').value;
  document.querySelector('#shop-intro').textContent = pace === 'busy'
    ? 'Busy day? Pick a detour you have room for.'
    : 'No rush today. See which little detour calls to you.';
}

function updateBag() {
  bag = items.filter((item, index) => itemInputs[index].checked);
  const full = bag.length === maxItems;
  itemInputs.forEach((input) => {
    input.disabled = full && !input.checked;
  });
  document.querySelector('#bag-count').textContent = full
    ? '3 / 3 items · Bag full'
    : `${bag.length} / ${maxItems} items`;
  checkout.disabled = bag.length === 0;
}

function showScreen(screen) {
  screens.forEach((id) => {
    document.getElementById(id).hidden = id !== screen;
  });
  const index = screens.indexOf(screen);
  document.querySelector('#step').textContent = `0${index + 1} / 04`;
  steps.forEach((step, position) => step.classList.toggle('current', position === index));
  const titleId = screen === 'receipt' && !purchased ? 'review-title' : `${screen}-title`;
  document.getElementById(titleId).focus();
}

function showReceipt() {
  if (bag.length === 0) return;
  resetFortune();
  const lines = bag.map((item) => {
    const line = document.createElement('li');
    line.textContent = purchased ? item.benefit : `${item.icon} ${item.name} — ${item.price}`;
    return line;
  });
  document.querySelector(purchased ? '#benefits' : '#order-items').replaceChildren(...lines);
  document.querySelector('#order-review').hidden = purchased;
  document.querySelector('#confirmation').hidden = !purchased;
  showScreen('receipt');
}

function resetFortune() {
  clearTimeout(revealTimer);
  revealTimer = undefined;
  parcel.classList.remove('unwrapped');
  unwrap.disabled = false;
  fortuneStatus.textContent = '';
}

function unwrapParcel() {
  if (!purchased || unwrap.disabled) return;
  unwrap.disabled = true;
  parcel.scrollIntoView({ block: 'center' });
  parcel.classList.add('unwrapped');
  fortuneStatus.textContent = 'The ribbon slips away. A card rises out of the box…';
  revealTimer = setTimeout(() => {
    revealTimer = undefined;
    revealStory();
  }, 850);
}

function getStory() {
  const has = (id) => bag.some((item) => item.id === id);
  const busy = pace === 'busy';

  if (has('pickup') && has('write')) {
    const reunion = busy
      ? 'You have just enough time to wave to an old friend at the pickup counter.'
      : 'You catch up with an old friend at the pickup counter until your fries go cold.';
    return {
      title: 'A Message After Dinner',
      scene: 'diner',
      setup: reunion + ' Later, you write to ask what happened to the diner you used to love.',
      paragraphs: ['Your friend sends a photo of its neon sign above their kitchen sink. “It’s still open,” they text. “Just for breakfast now.”'],
    };
  }

  if (has('transit') && has('ask')) {
    const outcome = busy
      ? 'You ask a stranger about the tune on the platform. They record the last few bars as your train pulls in. When you play it back, the loudest thing on it is the two of you laughing.'
      : 'You and a stranger miss a train trying to place the tune on the platform. Finally, you ask the busker. “It doesn’t have a name yet,” she says. “Want to give it one?”';
    return { title: 'Between Trains', scene: 'train', icons: ['🚇', '🎵'], paragraphs: [outcome] };
  }

  const opening = busy ? 'Between things you have to do, a detour catches you off guard.' : 'With nowhere you need to be just yet, you follow a detour.';
  return {
    title: 'A Small Detour',
    scene: 'detour',
    icons: bag.map((item) => item.icon),
    setup: opening,
    paragraphs: bag.map((item) => item.moment),
  };
}

function revealStory() {
  const story = getStory();
  document.querySelector('#ending-title').textContent = story.title;
  const artwork = document.querySelector('#ending-art');
  artwork.dataset.scene = story.scene;
  const setup = document.querySelector('#ending-setup');
  setup.hidden = !story.setup;
  setup.textContent = story.setup || '';
  if (story.scene === 'diner') {
    artwork.innerHTML = '<strong class="neon">OPEN</strong><div class="kitchen-sink"></div>';
  } else {
    const icons = story.icons.map((icon) => {
      const span = document.createElement('span');
      span.textContent = icon;
      return span;
    });
    artwork.replaceChildren(...icons);
  }
  const paragraphs = story.paragraphs.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  });
  document.querySelector('#ending-text').replaceChildren(...paragraphs);
  showScreen('story');
}

document.querySelectorAll('input[name="pace"]').forEach((input) => {
  input.addEventListener('change', updatePace);
});
shelf.addEventListener('change', updateBag);
document.querySelector('#enter').addEventListener('click', () => showScreen('shop'));
document.querySelector('#back').addEventListener('click', () => showScreen('welcome'));
checkout.addEventListener('click', showReceipt);
purchase.addEventListener('click', () => {
  purchased = true;
  showReceipt();
});
document.querySelector('#edit').addEventListener('click', () => {
  purchased = false;
  resetFortune();
  showScreen('shop');
});
unwrap.addEventListener('click', unwrapParcel);
document.querySelector('#return').addEventListener('click', showReceipt);
updatePace();
updateBag();
