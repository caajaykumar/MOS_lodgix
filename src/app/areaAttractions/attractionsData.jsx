const attractionsData = [
  {
    title: "Walt Disney World",
    image: "https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/activities/alg3puq4hmpeobqhumjd.webp",
    description:
      "Immerse yourself in the magic of Walt Disney World, where beloved characters, thrilling rides, and enchanting parades bring fairy tales to life. Perfect for families, this iconic destination offers endless fun across its four magical theme parks.",
    website: "https://disneyworld.disney.go.com/",
    location: "Florida, United States",
    mapLink: "https://maps.app.goo.gl/h5FbBscrTQg3TodM6",
    distance: "2.8 Miles from property",
  },
  {
    title: "Universal Studios",
    image: "https://www.thetopvillas.com/blog/wp-content/uploads/2022/01/Universal-rides-featured.jpg",
    description:
      "Step into the world of blockbuster movies at Universal Studios, where thrilling rides, live shows, and immersive experiences put you right in the action. From movie sets to heart-pounding adventures, it's a must-visit for film lovers.",
    website: "https://universalstudios.com/",
    location: "Florida, USA",
    mapLink: "https://www.universalstudioshollywood.com/web/en/us?utm_source=google&utm_medium=organic&utm_campaign=GMB",
    distance: "15.6 Miles from property",
  },
  {
    title: "Harry Potter World",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkeVNBfrP6i3LNrPL638YZdBcUEqmbiJ-Fig&s",
    description:
      "Enter the Wizarding World of Harry Potter and explore the magical streets of Diagon Alley, ride the Hogwarts Express, and experience the thrill of epic wizard duels. A spellbinding adventure for fans of all ages.",
    website: "https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida/the-wizarding-world-of-harry-potter-diagon-alley",
    location: "Florida, USA",
    mapLink: "https://maps.app.goo.gl/t98ruiHpuoSw7Xjf9",
    distance: "17.3 Miles from property",
  },
  {
    title: "SeaWorld Orlando",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuMlAYu8EXZbUTTj0yiI66rs9gpWLZD18EDakSU2O5WW2hzfNoLssOoCUrJ7PXLGcYP9Y&usqp=CAU",
    description:
      "Dive into marine life excitement at SeaWorld Orlando, where awe-inspiring shows, close-up animal encounters, and exhilarating rides create unforgettable experiences. Perfect for families of ocean enthusiasts and thrill-seekers alike.",
    website: "https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida/the-wizarding-world-of-harry-potter-diagon-alley",
    location: "Florida, USA",
    mapLink: "https://maps.app.goo.gl/t98ruiHpuoSw7Xjf9",
    distance: "17.3 Miles from property",
  },
  {
    title: "SEA LIFE Aquarium Orlando",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb-k2zabBXQB67ZrSRtfONUJv-zMJgvXwqAA&s",
    description:
      "Explore the wonders of the ocean at SEA LIFE Aquarium Orlando, home to thousands of sea creatures, including sharks, rays, and colorful fish. Interactive exhibits and underwater tunnels take you through an up-close marine adventure.",
    website: "https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida/the-wizarding-world-of-harry-potter-diagon-alley",
    location: "Florida, USA",
    mapLink: "https://maps.app.goo.gl/EsYNfT6VJK572Fdj7",
    distance: "12 Miles from property",
  },
  {
    title: "Kennedy Space Center",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnT0Zxwu30tA3ISmxN4ZiUQS3xXS0srKXOCA&s",
    description:
      "Discover the wonders of space exploration over the years at the John F Kennedy Space Center, where you can meet real astronauts, witness rocket launches, and explore interactive exhibits. Come along on a journey to the stars for all ages.",
    website: "https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida/the-wizarding-world-of-harry-potter-diagon-alley",
    location: "Florida, USA",
    mapLink: "https://maps.app.goo.gl/iNenfgjYcaJtCNLX8",
    distance: "64.3 Miles from property",
  },
  {
    title: "Disney Springs",
    image: "/img/area/2.jpg",
    description:
      "Shop, dine, and play at Disney Springs, an entertainment hub filled with unique stores, world-class restaurants, and live performances. A lively destination for a magical day or evening.",
    website: "https://www.disneysprings.com/",
    location: "Orlando, FL, USA",
    mapLink: "https://maps.app.goo.gl/TeyrvhngKPfDzNtNA",
    distance: "8.2 miles from property",
  },
  {
    title: "Epcot",
    image: "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRrhBEA1RzqljTE9QIXl1Ht1xPksUxP90oUNUrZ0I294j6fLYPYhmVN6hReKflJA8bA8YjsKl_-BZ1-QYVkiz4QACFkxcZ1vrnSziJE4A",
    description:
      "Explore the wonders of the world and the future at Epcot, where international pavilions, innovative attractions, and nightly fireworks displays come together in a celebration of imagination and discovery.",
    website: "https://disneyworld.disney.go.com/destinations/epcot/",
    location: "Epcot Center Dr, Orlando, FL 32821, USA",
    mapLink: "https://maps.app.goo.gl/bQ9WC5PkcqKcMmPx7",
    distance: "6.5 miles from property",
  },
  {
    title: "Discovery Cove",
    image: "https://lh5.googleusercontent.com/p/AF1QipPPjfbJgCm1gZXMBRQ5wcprKsIyT1V3TkmMLhEd=w810-h468-n-k-no",
    description:
      "Experience an unforgettable day at Discovery Cove, where you can swim with dolphins, snorkel through coral reefs, and relax on pristine beaches. A tropical oasis offering intimate wildlife encounters awaits you!",
    website: "https://discoverycove.com/orlando/?utm_source=google&utm_medium=organic&utm_campaign=gbp_listing",
    location: "Discovery Cove, 6000 Discovery Cove Way, Orlando, FL 32821, United States",
    mapLink: "https://maps.app.goo.gl/bQ9WC5PkcqKcMmPx7",
    distance: "13 miles from property",
  },
];

export default attractionsData;
