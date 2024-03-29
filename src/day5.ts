export function getSeedList(lines: string[]) {
  const seedsLine = lines.find((line) => line.startsWith("seeds:"));
  if (seedsLine) {
    const seeds = seedsLine.split("seeds:")[1].split(" ");
    const seedsAsNumbers = seeds.map((seed) => parseInt(seed));
    return seedsAsNumbers.filter((seed) => !isNaN(seed));
  } else return [];
}

type Seed = {
  id: number;
  range: number;
};
export function getSeedList2(lines: string[]) {
  const seedsLine = lines.find((line) => line.startsWith("seeds:"));
  const seedRangeList: Seed[] = [];
  if (seedsLine) {
    const seeds = seedsLine.split("seeds: ")[1].split(" ");
    for (let i = 0; i < seeds.length; i = i + 2) {
      seedRangeList.push({
        id: parseInt(seeds[i]),
        range: parseInt(seeds[i + 1]),
      });
    }
    const seedList: number[] = [];
    seedRangeList.forEach((list) => {
      for (let i = 0; i < list.range; i++) {
        seedList.push(list.id + i);
      }
    });
    return seedList;
  } else return [];
}

export function getMap(lines: string[], currentMap: string, nextMap: string) {
  const currentMapIndex = lines.indexOf(currentMap);

  const nextMapIndex = lines.indexOf(nextMap);

  if (currentMapIndex !== -1 && nextMapIndex !== -1) {
    return lines.slice(currentMapIndex + 1, nextMapIndex - 1);
  } else return [];
}

type Map = {
  destination: number;
  source: number;
  range: number;
};

/**
 * Maps over the string objec, converts to object
 * looks for line closes to source number
 * determins the destination number
 */
export function getDestinationForSource(
  sourceValue: number,
  mapping: string[]
) {
  const map = mapping.map((s) => {
    const line = s.split(" ");
    return {
      destination: parseInt(line[0]),
      source: parseInt(line[1]),
      range: parseInt(line[2]),
    };
  });

  const validMap = map.filter(
    (m) => m.source <= sourceValue && m.source + m.range >= sourceValue
  );

  if (validMap.length === 0) return sourceValue;

  const closestToSeedNumber = validMap.sort((a, b) => b.source - a.source);
  const line = closestToSeedNumber[0];

  const difference = sourceValue - line.source;
  return line.destination + difference;
}

export function getLocation(seed: number, lines: string[]) {
  const soilMap = getMap(lines, "seed-to-soil map:", "soil-to-fertilizer map:");
  const soil = getDestinationForSource(seed, soilMap);

  const fertilizerMap = getMap(
    lines,
    "soil-to-fertilizer map:",
    "fertilizer-to-water map:"
  );
  const fertilizer = getDestinationForSource(soil, fertilizerMap);

  const waterMap = getMap(
    lines,
    "fertilizer-to-water map:",
    "water-to-light map:"
  );
  const water = getDestinationForSource(fertilizer, waterMap);

  const lightMap = getMap(
    lines,
    "water-to-light map:",
    "light-to-temperature map:"
  );
  const light = getDestinationForSource(water, lightMap);

  const tempMap = getMap(
    lines,
    "light-to-temperature map:",
    "temperature-to-humidity map:"
  );
  const temp = getDestinationForSource(light, tempMap);

  const humidityMap = getMap(
    lines,
    "temperature-to-humidity map:",
    "humidity-to-location map:"
  );
  const humidity = getDestinationForSource(temp, humidityMap);

  const locationMap = getMap(lines, "humidity-to-location map:", "end map");

  const location = getDestinationForSource(humidity, locationMap);

  return location;
}

export function getSmallestLocation(
  lines: string[],
  seedList: (lines: string[]) => number[]
) {
  const seeds = seedList(lines);

  const locations = seeds.map((seed) => getLocation(seed, lines));

  return locations.sort((a, b) => a - b)[0];
}
