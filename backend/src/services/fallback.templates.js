export function ageBand(age) {
  switch (age) {
    case '2-3':
      return 'youngest';
    case '3-4':
      return 'young';
    case '4-5':
      return 'middle';
    case '5-6':
      return 'oldest';
    default: {
      const _exhaustive = age;
      return _exhaustive;
    }
  }
}
const FALLBACK_TEMPLATES = {
  Animals: {
    objective: {
      youngest: 'Children will name common animals when shown pictures.',
      young: 'Children will identify animals and the sounds they make.',
      middle:
        'Children will sort animals into groups (farm, wild, pets) and describe their features.',
      oldest:
        'Children will compare animal habitats and explain how animals adapt to where they live.',
    },
    activity: {
      youngest: `1. Sit in a circle and look at animal picture cards one at a time.\n2. Say the animal name and encourage children to repeat.\n3. Make the animal sound together.\n4. Let each child hold a card and place it on a soft mat.`,
      young: `1. Show 5 picture cards of different animals.\n2. Children name each animal and copy its sound.\n3. Play "who says this?" with sound effects.\n4. Sort cards into two piles: farm and wild.\n5. End with a quick rhyme about the animals seen.`,
      middle: `1. Display animal cards on the floor in three groups: farm, wild, pets.\n2. Children take turns placing new cards into the right group.\n3. Discuss what each animal eats and where it sleeps.\n4. Build a simple food chain with picture strips.\n5. Children draw their favorite animal and name it.`,
      oldest: `1. Begin with a short story about a forest, a desert, and an ocean.\n2. Children match animal cards to the right habitat.\n3. Discuss how each animal adapts (fur, fins, wings).\n4. In small groups, children invent a new animal and describe its habitat.\n5. Share inventions with the class.`,
    },
    rhyme: {
      youngest: 'Cat says meow, dog says woof,\nLamb goes baa and bull goes moof.',
      young: 'Old MacDonald had a farm, ee-i-ee-i-o!\nAnd on that farm he had a cow, ee-i-ee-i-o!',
      middle:
        "Hop little bunny, hop hop hop,\nFlutter little butterfly, don't you stop.\nSplash little fish, in the pond so blue,\nThe animal world is fun to walk through.",
      oldest:
        'In the jungle, in the sea,\nAnimals live wild and free.\nSome have fur and some have scales,\nEvery creature tells a tale.',
    },
    worksheet: {
      youngest: 'Circle the animal. Point to its eyes, nose, and tail.',
      young: 'Match each animal to its home. Color the picture.',
      middle: 'Sort the animal cards into the correct habitat. Draw your favorite animal.',
      oldest:
        'Draw two animals from different habitats. Write one way each animal adapts to where it lives.',
    },
    materials: ['Animal picture cards', 'Crayons', 'Soft toy animal', 'Sorting mat'],
    topicNouns: { singular: 'animal', plural: 'animals' },
  },
  Colors: {
    objective: {
      youngest: 'Children will point to red, blue, and yellow when asked.',
      young: 'Children will name at least four colors in the room.',
      middle: 'Children will mix two primary colors to make a secondary color.',
      oldest: 'Children will describe objects using color words and predict color mixing.',
    },
    activity: {
      youngest: `1. Show three color cards (red, blue, yellow).\n2. Children point to objects in the room of the same color.\n3. Sing a colors song together.\n4. Let children finger-paint with one color each.`,
      young: `1. Set out crayons in many colors on the table.\n2. Children find something in the room for each color.\n3. Play "I spy" using color clues.\n4. Color a simple picture using only three colors.`,
      middle: `1. Demonstrate mixing yellow + blue = green.\n2. Children predict and test other mixes.\n3. Paint a small color wheel together.\n4. Sort buttons by color into jars.`,
      oldest: `1. Talk about warm vs. cool colors.\n2. Children paint a picture using only warm or only cool colors.\n3. Discuss feelings different colors bring.\n4. Build a class color chart with names.`,
    },
    rhyme: {
      youngest: 'Red and blue and yellow too,\nColors all around for you.',
      young: 'Red apple, blue sky so bright,\nYellow sun, green grass in light.',
      middle:
        'Mix red and yellow, what do you see?\nOrange juice and a bumblebee!\nMix blue and yellow, oh what fun!\nGreen grass waving in the sun.',
      oldest:
        "Colors speak in every land,\nMix them gently, take a stand.\nA sunset orange, ocean blue,\nThe rainbow's colors live in you.",
    },
    worksheet: {
      youngest: 'Color the apple red, the sky blue, the sun yellow.',
      young: 'Color each shape with the right color. Find a matching color in the room.',
      middle: 'Color the wheel. Write the name of each color next to its slice.',
      oldest: 'Design your own flag using exactly three colors. Explain what each color means.',
    },
    materials: ['Color cards', 'Crayons', 'Plain paper', 'Finger paint (optional)'],
    topicNouns: { singular: 'color', plural: 'colors' },
  },
  'Numbers & Counting': {
    objective: {
      youngest: 'Children will count aloud from 1 to 5.',
      young: 'Children will count 5–10 objects correctly.',
      middle: 'Children will add two groups of objects up to 10.',
      oldest: 'Children will compare quantities (more, less, equal) up to 20.',
    },
    activity: {
      youngest: `1. Sing a counting song with fingers.\n2. Count 3 blocks together.\n3. Tap table 1-2-3-4-5.\n4. Place 3 cups and drop 1 ball in each.`,
      young: `1. Count out loud 1 to 10 using beads.\n2. Match numeral cards to sets of objects.\n3. Play "how many?" with small items.\n4. Build a tower and count its blocks.`,
      middle: `1. Put 4 bears on one plate, 3 on another. Count both.\n2. Combine plates: how many altogether?\n3. Write the sum on the board.\n4. Repeat with 5+5 and 6+4.`,
      oldest: `1. Show 7 red cubes and 9 blue cubes. Which has more?\n2. Add a hidden cube; recompute.\n3. Subtract 2 from each group; recount.\n4. Children make their own + and − problems.`,
    },
    rhyme: {
      youngest: 'One, two, three, four, five,\nOnce I caught a fish alive.',
      young:
        '1, 2, 3, jump with me,\n4, 5, 6, count the tree,\n7, 8, 9, hold them tight,\n10 little fingers, all tucked in tight.',
      middle:
        "Five little apples in a row,\nOne, two, three, four, five — let's go!\nAdd one more, now we have six,\nPick another — seven, what a fix!",
      oldest:
        'Zero is a hero, yes indeed,\nAdd a one and you take the lead.\nTake away and you will find,\nNumbers are a friend of mine.',
    },
    worksheet: {
      youngest: 'Trace the numbers 1, 2, 3. Draw 3 apples.',
      young: 'Count the dots and circle the right numeral.',
      middle: 'Add the bears: 4 + 3 = __. Draw your answer.',
      oldest: 'Solve 7 + 5 = __ and 12 − 4 = __. Show your work with cubes or drawings.',
    },
    materials: ['Number flashcards', 'Counting beads', 'Paper cups', 'Small blocks'],
    topicNouns: { singular: 'number', plural: 'numbers' },
  },
  'Family & Friends': {
    objective: {
      youngest: 'Children will name a family member (mama, papa, etc.).',
      young: 'Children will name roles in a family and a friend.',
      middle: 'Children will describe how families and friends are different and alike.',
      oldest: 'Children will talk about what makes a good friend and how to show kindness.',
    },
    activity: {
      youngest: `1. Show a photo of your own family.\n2. Each child names one family member.\n3. Sing "mother and father" with actions.\n4. Hug a friend gently.`,
      young: `1. Children share who lives at home.\n2. Draw a portrait of a family member.\n3. Role-play saying please and thank you.\n4. Pair up and compliment each other.`,
      middle: `1. Build a "family tree" on the wall with photos.\n2. Discuss what families do together.\n3. Talk about friends: how to be kind.\n4. Write a thank-you card to a friend.`,
      oldest: `1. Discuss: what makes a good friend?\n2. Children interview a partner about their family.\n3. Class shares one kindness they will do this week.\n4. Make a class kindness jar.`,
    },
    rhyme: {
      youngest: 'Mama, papa, baby too,\nWe love them, me and you.',
      young: 'Friends, friends, 1, 2, 3,\nYou and me and we are we!',
      middle:
        'I love my family, big and small,\nI help at home and give my all.\nI love my friends, I share and play,\nWe laugh and learn throughout the day.',
      oldest:
        'A family is a circle strong,\nWhere love belongs and friends belong.\nWe lift each other, hand in hand,\nA kind word travels across the land.',
    },
    worksheet: {
      youngest: 'Draw a picture of your family. Point to mama, papa, baby.',
      young: 'Draw your family and your best friend. Circle the ones who live with you.',
      middle:
        'Write three things your family likes to do. Draw a heart for one friend who is kind.',
      oldest: 'Write about a time a friend helped you. Draw the moment. Add a kind sentence below.',
    },
    materials: ['Family photo cards (optional)', 'Drawing sheet', 'Crayons', 'Stickers'],
    topicNouns: { singular: 'family', plural: 'families' },
  },
  'Seasons & Weather': {
    objective: {
      youngest: 'Children will name sunny and rainy weather.',
      young: 'Children will describe what to wear in different weather.',
      middle: 'Children will name the four seasons and one feature of each.',
      oldest: 'Children will explain how weather changes across seasons and what to wear.',
    },
    activity: {
      youngest: `1. Look out the window. Is it sunny or rainy?\n2. Sing a weather song with actions.\n3. Pass a cotton ball "cloud" around.\n4. Look at pictures of sunny and rainy days.`,
      young: `1. Show 4 weather cards. Children dress a paper doll to match.\n2. Walk outside and feel the wind.\n3. Make a sun with yellow paper.\n4. Talk about yesterday's weather.`,
      middle: `1. Build a 4-seasons poster together.\n2. Children sort clothing by season.\n3. Read a short story about rain.\n4. Plant a seed to "watch the seasons" in class.`,
      oldest: `1. Discuss the four seasons; which is your favorite and why?\n2. Children keep a 1-week weather chart.\n3. Compare two days: warmer, colder, sunnier.\n4. Plan a year of class outings by season.`,
    },
    rhyme: {
      youngest: 'Sun is hot, rain is wet,\nWind is blowing, I can bet!',
      young: 'Whether sun or whether rain,\nWe have fun just the same.',
      middle:
        "Spring brings flowers, summer sun,\nAutumn leaves, winter's fun.\nSeasons come and seasons go,\nWatch the world put on a show.",
      oldest:
        'The sun climbs high, the sun sinks low,\nThe seasons turn, the winds do blow.\nFrom sprouts in spring to winter snow,\nThe year keeps moving to and fro.',
    },
    worksheet: {
      youngest: 'Circle the picture of a sunny day. Color the sun yellow.',
      young: 'Match each clothing item to the correct season. Color them.',
      middle: 'Draw a tree in all four seasons. Write one word for each season.',
      oldest: "Make a 5-day weather chart. Predict tomorrow's weather and explain why.",
    },
    materials: ['Season picture cards', 'Cotton balls', 'Paper plate', 'Crayons'],
    topicNouns: { singular: 'season', plural: 'seasons' },
  },
  'Plants & Gardens': {
    objective: {
      youngest: 'Children will name plant parts (leaf, flower).',
      young: 'Children will describe what plants need to grow.',
      middle: 'Children will plant a seed and identify its parts.',
      oldest: 'Children will explain how plants make food and what they need to thrive.',
    },
    activity: {
      youngest: `1. Bring a small plant to circle time.\n2. Touch the leaves and petals gently.\n3. Water the plant with a small can.\n4. Draw a flower with three colors.`,
      young: `1. Show a real plant; name roots, stem, leaves, flower.\n2. Children water a classroom plant.\n3. Plant a bean in a clear cup with a wet paper towel.\n4. Predict what will grow first.`,
      middle: `1. Plant seeds in small pots; label with names.\n2. Place some in sun, some in shade.\n3. Discuss why plants need water and light.\n4. Children draw their plant each day for a week.`,
      oldest: `1. Discuss photosynthesis in simple words.\n2. Set up a class garden box; assign watering duties.\n3. Keep a growth journal with measurements.\n4. Compare fast- and slow-growing plants.`,
    },
    rhyme: {
      youngest: 'Little seed, sleep so tight,\nWake up soon in warm sunlight.',
      young: 'Seed, sprout, leaf, and flower,\nGrow, grow, grow!',
      middle:
        "Plant a seed so small and round,\nWater, sun, and soft, warm ground.\nUp pops a sprout, then leaves so green,\nThe biggest, juiciest plant you've seen!",
      oldest:
        "Roots drink deep, leaves drink light,\nStems hold up the plant upright.\nFrom tiny seed to towering tree,\nA plant's slow magic helps us breathe.",
    },
    worksheet: {
      youngest: 'Color the flower. Point to the leaf and the petal.',
      young: 'Draw a plant. Label the leaf, stem, and flower.',
      middle: 'Number the plant parts in order of growth: seed → sprout → leaf → flower.',
      oldest: 'Design a small garden plan. Write which plants need sun and which need shade.',
    },
    materials: ['Seed packets (beans)', 'Small pots', 'Soil', 'Watering can'],
    topicNouns: { singular: 'plant', plural: 'plants' },
  },
  'Transport & Vehicles': {
    objective: {
      youngest: 'Children will name cars, buses, and trains.',
      young: 'Children will match vehicles to where they go (road, sky, water).',
      middle: 'Children will describe how vehicles move (wheels, wings, propellers).',
      oldest: 'Children will explain the difference between land, water, and air transport.',
    },
    activity: {
      youngest: `1. Show toy vehicles; children roll them on the floor.\n2. Make "vroom" and "beep-beep" sounds.\n3. Sing "the wheels on the bus" with actions.\n4. Sort toys into "wheels" and "wings".`,
      young: `1. Set up a cardboard road, water, and sky area.\n2. Children sort toy vehicles to the right area.\n3. Talk about who drives each one.\n4. Build a simple bus with a cardboard box.`,
      middle: `1. Children name vehicles for land, sea, and air.\n2. Roll, float, and fly toy vehicles to test movement.\n3. Count wheels on different vehicles.\n4. Plan a class trip: which vehicle would you use?`,
      oldest: `1. Discuss emergency vehicles and their roles.\n2. Children design a new vehicle on paper.\n3. Explain how it moves and what it carries.\n4. Vote on the best design.`,
    },
    rhyme: {
      youngest: 'Wheels go round, the bus goes beep,\nTime to sit, time to sleep.',
      young: 'Cars on the road, boats in the bay,\nPlanes in the sky fly far away.',
      middle:
        'Trains go clickety-clack down the track,\nBoats go splash when they come back.\nPlanes go zoom across the blue,\nBicycles are for me and you.',
      oldest:
        "Wheels and wings and rudders, too,\nTransport shapes the world we view.\nFrom carts to rockets, far we roam,\nA vehicle's a kind of home.",
    },
    worksheet: {
      youngest: 'Circle the car. Color the wheels black.',
      young: 'Draw a line from each vehicle to the place it goes (road, water, sky).',
      middle: 'Draw three vehicles. Count and write the number of wheels on each.',
      oldest:
        'Design a new vehicle. Label its parts and write one sentence about how it helps people.',
    },
    materials: ['Toy vehicles', 'Picture cards', 'Cardboard boxes', 'Crayons'],
    topicNouns: { singular: 'vehicle', plural: 'vehicles' },
  },
  'Water & Bubbles': {
    objective: {
      youngest: 'Children will feel and describe water (wet, cold).',
      young: 'Children will predict which objects sink or float.',
      middle: 'Children will test objects and sort sinkers from floaters.',
      oldest: 'Children will explain why some things float and others sink.',
    },
    activity: {
      youngest: `1. Put a small tub of water on the floor.\n2. Children dip hands; describe "wet" and "cold".\n3. Blow bubbles; pop them gently.\n4. Wipe hands and play a "splash" song.`,
      young: `1. Fill a basin with water.\n2. Children drop small objects in; guess sink or float first.\n3. Sort results into two piles.\n4. Try blowing bubbles with a wand.`,
      middle: `1. Predict, then test 10 objects in water.\n2. Record results on a chart: sink / float.\n3. Discuss patterns: heavy vs. light, big vs. small.\n4. Make bubble prints by blowing colored soap.`,
      oldest: `1. Discuss density in simple terms.\n2. Children explain why a needle can float with surface tension.\n3. Build a small boat from foil; load it with coins until it sinks.\n4. Discuss water safety near rivers and pools.`,
    },
    rhyme: {
      youngest: 'Splash, splash, water wet,\nIn the tub, I am, you bet!',
      young: 'Bubble, bubble, pop! pop! pop!\nWater in my cup on top.',
      middle:
        'Drop a stone, it sinks below,\nDrop a leaf, it floats just so.\nBubbles rise, bubbles fall,\nWater is a friend to us all.',
      oldest:
        'A molecule of H-two-O,\nHolds its bonds, both high and low.\nIt flows, it freezes, it boils away,\nThe most important stuff each day.',
    },
    worksheet: {
      youngest: 'Circle the things that float. Color the water blue.',
      young: 'Draw a line from each object to "sink" or "float".',
      middle: 'Test 6 objects at home. Record sink / float in a table.',
      oldest: 'Draw a boat and label what makes it float. Predict how many marbles it can hold.',
    },
    materials: [
      'Bubble solution',
      'Blowing wand',
      'Plastic cups',
      'Towels',
      'Small objects to test',
    ],
    topicNouns: { singular: 'water drop', plural: 'water drops' },
  },
  Shapes: {
    objective: {
      youngest: 'Children will name circle, square, and triangle.',
      young: 'Children will sort objects by shape.',
      middle: 'Children will identify shapes in everyday objects.',
      oldest: 'Children will combine shapes to draw objects and name new shapes.',
    },
    activity: {
      youngest: `1. Show 3 shape cutouts: circle, square, triangle.\n2. Children trace each in the air.\n3. Find the same shapes on a poster.\n4. Build a tower of 3 squares.`,
      young: `1. Pass out shape cutouts.\n2. Children sort blocks into shape piles.\n3. Go on a "shape hunt" around the room.\n4. Draw a simple house with shapes.`,
      middle: `1. Sort a mixed pile by shape.\n2. Find shapes in magazine pictures.\n3. Build a robot using only shapes.\n4. Draw a house, sun, and tree using basic shapes.`,
      oldest: `1. Discuss 3D shapes: sphere, cube, cone, pyramid.\n2. Children build 3D models with toothpicks and clay.\n3. Create a shape collage.\n4. Solve shape puzzles.`,
    },
    rhyme: {
      youngest: 'Circle, square, triangle three,\nShapes are fun, you and me.',
      young: 'A circle rolls, a square stacks tall,\nA triangle points up like a wall.',
      middle:
        'Round and round the circle goes,\nSquare has corners, four in a row.\nTriangle has three points so neat,\nShapes are friends on every street.',
      oldest:
        'A sphere rolls smoothly, cube sits tight,\nA pyramid points up to the light.\nFrom circles, squares, and triangles too,\nWe build the world for me and you.',
    },
    worksheet: {
      youngest: 'Circle the triangles. Color the squares blue.',
      young: 'Match the shape to its name. Draw one of each shape.',
      middle: 'Draw a robot using at least four different shapes. Label each shape.',
      oldest: 'Design a "shape city". Use five different shapes and label each building.',
    },
    materials: ['Shape cutouts', 'Drawing sheet', 'Crayons', 'Pattern blocks'],
    topicNouns: { singular: 'shape', plural: 'shapes' },
  },
  'My Body': {
    objective: {
      youngest: 'Children will point to eyes, nose, and mouth.',
      young: 'Children will name body parts and what they do.',
      middle: 'Children will describe how the five senses work.',
      oldest: 'Children will explain how to keep their body healthy.',
    },
    activity: {
      youngest: `1. Sing "head, shoulders, knees, and toes".\n2. Point to each part on a doll.\n3. Children touch their own face parts.\n4. Look in a mirror and smile.`,
      young: `1. Show flashcards of body parts.\n2. Children act out: "I see with my eyes", "I hear with my ears".\n3. Trace a friend's outline on big paper.\n4. Label the outline together.`,
      middle: `1. Explore the five senses: taste, smell, touch, sight, sound.\n2. Identify the body part for each sense.\n3. Smell mystery jars; guess the scent.\n4. Play a "sound" guessing game.`,
      oldest: `1. Discuss healthy habits: sleep, food, water, exercise.\n2. Children set a personal goal for the week.\n3. Plan a class "healthy plate" with food groups.\n4. Make a hand-washing poster.`,
    },
    rhyme: {
      youngest: 'Eyes to see, ears to hear,\nNose to smell, mouth to cheer.',
      young: 'My hands can clap, my feet can tap,\nMy body is a wonder-map.',
      middle:
        'Two eyes to see, two ears to hear,\nA nose to smell, a mouth so dear.\nTwo hands to hold, two feet to run,\nMy body is a job well done.',
      oldest:
        "My heart beats steady, my lungs breathe deep,\nMy brain is busy, my muscles leap.\nI care for my body, inside and out,\nThat's what good health is all about.",
    },
    worksheet: {
      youngest: 'Color the eyes blue, the nose red, the mouth pink.',
      young: 'Label the body parts on the picture. Color them.',
      middle: 'Draw yourself. Label the five senses and the body part for each.',
      oldest: 'Make a "Healthy Me" poster. Show sleep, food, water, and exercise.',
    },
    materials: ['Body part flashcards', 'Mirror', 'Bandages (for role play)', 'Crayons'],
    topicNouns: { singular: 'body part', plural: 'body parts' },
  },
};
const DEFAULT_PROFILE = {
  objective: {
    youngest: 'Children will explore the theme through sight and touch.',
    young: 'Children will describe the theme in simple words.',
    middle: 'Children will sort and compare ideas about the theme.',
    oldest: 'Children will explain and connect ideas about the theme.',
  },
  activity: {
    youngest: `1. Sit in a circle and introduce the theme.\n2. Show 3 picture cards.\n3. Children name what they see.\n4. Sing a short rhyme about the theme.`,
    young: `1. Look at picture cards and name items.\n2. Sort cards into two groups.\n3. Talk about one favorite thing.\n4. Draw a picture of the theme.`,
    middle: `1. Sort items into groups.\n2. Compare two groups: how are they different?\n3. Build something small to represent the theme.\n4. Share with a partner.`,
    oldest: `1. Discuss what the theme means in everyday life.\n2. Make a chart of ideas as a class.\n3. Children write a short story about the theme.\n4. Share stories aloud.`,
  },
  rhyme: {
    youngest: 'Theme, theme, fun to play,\nWe learn new things every day.',
    young: 'A theme a day, a smile a mile,\nWe learn together, style by style.',
    middle:
      'Imagine, explore, and try,\nA theme is a friend that you can rely.\nWe sort, we sort, we sort and play,\nLearning gets better every day.',
    oldest:
      'A theme is a window, open wide,\nA teacher, a puzzle, a friend, a guide.\nWe dig, we wonder, we connect,\nAnd every new idea becomes a link.',
  },
  worksheet: {
    youngest: 'Color the picture. Point to one thing you learned.',
    young: 'Draw a picture of the theme. Write one word about it.',
    middle: 'Sort the words into two columns. Draw a picture to go with each.',
    oldest: 'Write three facts about the theme. Draw a diagram to show how they connect.',
  },
  materials: ['Picture cards', 'Crayons', 'Paper sheet', 'Sorting tray'],
  topicNouns: { singular: 'thing', plural: 'things' },
};
export function getFallbackTemplate(theme, age) {
  const profile = FALLBACK_TEMPLATES[theme] ?? DEFAULT_PROFILE;
  const band = ageBand(age);
  return {
    objective: profile.objective[band],
    activity: profile.activity[band],
    rhyme: profile.rhyme[band],
    worksheet: profile.worksheet[band],
    materials: profile.materials,
  };
}
