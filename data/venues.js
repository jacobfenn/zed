// Known venues with coordinates; teams are 'Place|Nickname[|extra alias...]' grouped by the sport names used in the form.
const KNOWN_VENUES = [];
const SPORT_COLORS = {
  'College Baseball': '#a0522d',
  'College Basketball': '#7b3fa0',
  'College Football': '#2e7d32',
  MLB: '#c8102e',
  NASCAR: '#a97a00',
  NBA: '#d9531e',
  NFL: '#1f4e8c',
  NHL: '#2a7fa8',
  Other: '#4d5a73'
};
const venueByName = new Map();
const venuesByTeam = new Map();

function normalizeName(text) {
  return String(text)
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function teamAliases(spec) {
  const [place, nickname, ...extra] = spec.split('|');
  const aliases = nickname
    ? [place, nickname, `${place} ${nickname}`, ...extra]
    : [place];

  if (place === 'Los Angeles') {
    aliases.push(`LA ${nickname}`);
  } else if (place === 'New York') {
    aliases.push(`NY ${nickname}`);
  }

  return aliases.filter(Boolean).map(normalizeName);
}

function addVenue(name, city, lat, lng, teams = {}, aliases = []) {
  const venue = { name, city, lat, lng, teams, aliases };
  KNOWN_VENUES.push(venue);

  [name, ...aliases].forEach((venueName) => venueByName.set(normalizeName(venueName), venue));

  Object.entries(teams).forEach(([sport, specs]) => {
    specs.forEach((spec) => {
      teamAliases(spec).forEach((alias) => {
        const key = `${sport}|${alias}`;
        const venues = venuesByTeam.get(key) || new Set();
        venues.add(venue);
        venuesByTeam.set(key, venues);
      });
    });
  });
}

// Returns a venue only when the team name points to exactly one home venue for that sport.
function findHomeVenue(teamName, sport) {
  const venues = venuesByTeam.get(`${sport}|${normalizeName(teamName)}`);
  return venues && venues.size === 1 ? [...venues][0] : null;
}

// NFL
addVenue('State Farm Stadium', 'Glendale, AZ', 33.5276, -112.2626, { NFL: ['Arizona|Cardinals'] });
addVenue('Mercedes-Benz Stadium', 'Atlanta, GA', 33.7554, -84.4009, { NFL: ['Atlanta|Falcons'] });
addVenue('M&T Bank Stadium', 'Baltimore, MD', 39.278, -76.6227, { NFL: ['Baltimore|Ravens'] });
addVenue('Highmark Stadium', 'Orchard Park, NY', 42.7738, -78.787, { NFL: ['Buffalo|Bills'] }, ['New Era Field', 'Ralph Wilson Stadium']);
addVenue('Bank of America Stadium', 'Charlotte, NC', 35.2258, -80.8528, { NFL: ['Carolina|Panthers'] });
addVenue('Soldier Field', 'Chicago, IL', 41.8623, -87.6167, { NFL: ['Chicago|Bears'] });
addVenue('Paycor Stadium', 'Cincinnati, OH', 39.0955, -84.5161, { NFL: ['Cincinnati|Bengals'] }, ['Paul Brown Stadium']);
addVenue('Huntington Bank Field', 'Cleveland, OH', 41.5061, -81.6995, { NFL: ['Cleveland|Browns'] }, ['FirstEnergy Stadium', 'Cleveland Browns Stadium']);
addVenue('AT&T Stadium', 'Arlington, TX', 32.7473, -97.0945, { NFL: ['Dallas|Cowboys'] });
addVenue('Empower Field at Mile High', 'Denver, CO', 39.7439, -105.0201, { NFL: ['Denver|Broncos'] }, ['Mile High', 'Sports Authority Field at Mile High']);
addVenue('Ford Field', 'Detroit, MI', 42.34, -83.0456, { NFL: ['Detroit|Lions'] });
addVenue('Lambeau Field', 'Green Bay, WI', 44.5013, -88.0622, { NFL: ['Green Bay|Packers'] });
addVenue('NRG Stadium', 'Houston, TX', 29.6847, -95.4107, { NFL: ['Houston|Texans'] });
addVenue('Lucas Oil Stadium', 'Indianapolis, IN', 39.7601, -86.1639, { NFL: ['Indianapolis|Colts'] });
addVenue('EverBank Stadium', 'Jacksonville, FL', 30.3239, -81.6373, { NFL: ['Jacksonville|Jaguars'] }, ['TIAA Bank Field']);
addVenue('GEHA Field at Arrowhead Stadium', 'Kansas City, MO', 39.0489, -94.4839, { NFL: ['Kansas City|Chiefs'] }, ['Arrowhead Stadium', 'Arrowhead']);
addVenue('Allegiant Stadium', 'Las Vegas, NV', 36.0909, -115.1833, { NFL: ['Las Vegas|Raiders'] });
addVenue('SoFi Stadium', 'Inglewood, CA', 33.9535, -118.3392, { NFL: ['Los Angeles|Rams', 'Los Angeles|Chargers'] });
addVenue('Hard Rock Stadium', 'Miami Gardens, FL', 25.958, -80.2389, { NFL: ['Miami|Dolphins'], 'College Football': ['Miami|Hurricanes', 'Miami (FL)'] });
addVenue('U.S. Bank Stadium', 'Minneapolis, MN', 44.9736, -93.2575, { NFL: ['Minnesota|Vikings'] });
addVenue('Gillette Stadium', 'Foxborough, MA', 42.0909, -71.2643, { NFL: ['New England|Patriots'] });
addVenue('Caesars Superdome', 'New Orleans, LA', 29.9511, -90.0812, { NFL: ['New Orleans|Saints'] }, ['Superdome', 'Mercedes-Benz Superdome']);
addVenue('MetLife Stadium', 'East Rutherford, NJ', 40.8135, -74.0745, { NFL: ['New York|Giants', 'New York|Jets'] });
addVenue('Lincoln Financial Field', 'Philadelphia, PA', 39.9008, -75.1675, { NFL: ['Philadelphia|Eagles'] }, ['The Linc']);
addVenue('Acrisure Stadium', 'Pittsburgh, PA', 40.4468, -80.0158, { NFL: ['Pittsburgh|Steelers'], 'College Football': ['Pittsburgh|Panthers', 'Pitt'] }, ['Heinz Field']);
addVenue("Levi's Stadium", 'Santa Clara, CA', 37.403, -121.97, { NFL: ['San Francisco|49ers', 'San Francisco|Niners'] });
addVenue('Lumen Field', 'Seattle, WA', 47.5952, -122.3316, { NFL: ['Seattle|Seahawks'] }, ['CenturyLink Field']);
addVenue('Raymond James Stadium', 'Tampa, FL', 27.9759, -82.5033, { NFL: ['Tampa Bay|Buccaneers', 'Tampa Bay|Bucs'] });
addVenue('Nissan Stadium', 'Nashville, TN', 36.1665, -86.7713, { NFL: ['Tennessee|Titans'] });
addVenue('Northwest Stadium', 'Landover, MD', 38.9077, -76.8645, { NFL: ['Washington|Commanders'] }, ['FedExField', 'FedEx Field']);

// MLB
addVenue('Chase Field', 'Phoenix, AZ', 33.4453, -112.0667, { MLB: ['Arizona|Diamondbacks', 'Arizona|D-backs'] });
addVenue('Truist Park', 'Atlanta, GA', 33.8908, -84.4678, { MLB: ['Atlanta|Braves'] });
addVenue('Oriole Park at Camden Yards', 'Baltimore, MD', 39.2839, -76.6217, { MLB: ['Baltimore|Orioles'] }, ['Camden Yards']);
addVenue('Fenway Park', 'Boston, MA', 42.3467, -71.0972, { MLB: ['Boston|Red Sox'] });
addVenue('Wrigley Field', 'Chicago, IL', 41.9484, -87.6553, { MLB: ['Chicago|Cubs'] });
addVenue('Rate Field', 'Chicago, IL', 41.83, -87.6339, { MLB: ['Chicago|White Sox'] }, ['Guaranteed Rate Field', 'US Cellular Field', 'Comiskey Park']);
addVenue('Great American Ball Park', 'Cincinnati, OH', 39.0974, -84.5066, { MLB: ['Cincinnati|Reds'] });
addVenue('Progressive Field', 'Cleveland, OH', 41.4962, -81.6852, { MLB: ['Cleveland|Guardians'] });
addVenue('Coors Field', 'Denver, CO', 39.7559, -104.9942, { MLB: ['Colorado|Rockies'] });
addVenue('Comerica Park', 'Detroit, MI', 42.339, -83.0485, { MLB: ['Detroit|Tigers'] });
addVenue('Daikin Park', 'Houston, TX', 29.7573, -95.3555, { MLB: ['Houston|Astros'] }, ['Minute Maid Park']);
addVenue('Kauffman Stadium', 'Kansas City, MO', 39.0517, -94.4803, { MLB: ['Kansas City|Royals'] });
addVenue('Angel Stadium', 'Anaheim, CA', 33.8003, -117.8827, { MLB: ['Los Angeles|Angels', 'Anaheim|Angels'] });
addVenue('Dodger Stadium', 'Los Angeles, CA', 34.0739, -118.24, { MLB: ['Los Angeles|Dodgers'] });
addVenue('loanDepot park', 'Miami, FL', 25.7781, -80.2196, { MLB: ['Miami|Marlins'] }, ['Marlins Park']);
addVenue('American Family Field', 'Milwaukee, WI', 43.028, -87.9712, { MLB: ['Milwaukee|Brewers'] }, ['Miller Park']);
addVenue('Target Field', 'Minneapolis, MN', 44.9817, -93.2776, { MLB: ['Minnesota|Twins'] });
addVenue('Citi Field', 'Queens, NY', 40.7571, -73.8458, { MLB: ['New York|Mets'] });
addVenue('Yankee Stadium', 'Bronx, NY', 40.8296, -73.9262, { MLB: ['New York|Yankees'] });
addVenue('Sutter Health Park', 'West Sacramento, CA', 38.5803, -121.5138, { MLB: ['Athletics|A\'s', 'Oakland|Athletics', 'Oakland|A\'s'] });
addVenue('Citizens Bank Park', 'Philadelphia, PA', 39.9061, -75.1665, { MLB: ['Philadelphia|Phillies'] });
addVenue('PNC Park', 'Pittsburgh, PA', 40.4469, -80.0057, { MLB: ['Pittsburgh|Pirates'] });
addVenue('Petco Park', 'San Diego, CA', 32.7073, -117.1566, { MLB: ['San Diego|Padres'] });
addVenue('Oracle Park', 'San Francisco, CA', 37.7786, -122.3893, { MLB: ['San Francisco|Giants'] }, ['AT&T Park']);
addVenue('T-Mobile Park', 'Seattle, WA', 47.5914, -122.3325, { MLB: ['Seattle|Mariners'] }, ['Safeco Field']);
addVenue('Busch Stadium', 'St. Louis, MO', 38.6226, -90.1928, { MLB: ['St. Louis|Cardinals', 'St Louis|Cardinals'] });
addVenue('Tropicana Field', 'St. Petersburg, FL', 27.7682, -82.6534, { MLB: ['Tampa Bay|Rays'] });
addVenue('Globe Life Field', 'Arlington, TX', 32.7473, -97.0847, { MLB: ['Texas|Rangers'] });
addVenue('Rogers Centre', 'Toronto, ON', 43.6414, -79.3894, { MLB: ['Toronto|Blue Jays'] }, ['SkyDome']);
addVenue('Nationals Park', 'Washington, DC', 38.873, -77.0074, { MLB: ['Washington|Nationals'] });

// NBA and NHL arenas
addVenue('State Farm Arena', 'Atlanta, GA', 33.7573, -84.3963, { NBA: ['Atlanta|Hawks'] });
addVenue('TD Garden', 'Boston, MA', 42.3662, -71.0621, { NBA: ['Boston|Celtics'], NHL: ['Boston|Bruins'] });
addVenue('Barclays Center', 'Brooklyn, NY', 40.6826, -73.9754, { NBA: ['Brooklyn|Nets'] });
addVenue('Spectrum Center', 'Charlotte, NC', 35.2251, -80.8392, { NBA: ['Charlotte|Hornets'] });
addVenue('United Center', 'Chicago, IL', 41.8807, -87.6742, { NBA: ['Chicago|Bulls'], NHL: ['Chicago|Blackhawks'] });
addVenue('Rocket Arena', 'Cleveland, OH', 41.4965, -81.6882, { NBA: ['Cleveland|Cavaliers', 'Cleveland|Cavs'] }, ['Rocket Mortgage FieldHouse', 'Quicken Loans Arena']);
addVenue('American Airlines Center', 'Dallas, TX', 32.7905, -96.8103, { NBA: ['Dallas|Mavericks', 'Dallas|Mavs'], NHL: ['Dallas|Stars'] });
addVenue('Ball Arena', 'Denver, CO', 39.7487, -105.0077, { NBA: ['Denver|Nuggets'], NHL: ['Colorado|Avalanche'] }, ['Pepsi Center']);
addVenue('Little Caesars Arena', 'Detroit, MI', 42.341, -83.0553, { NBA: ['Detroit|Pistons'], NHL: ['Detroit|Red Wings'] });
addVenue('Chase Center', 'San Francisco, CA', 37.768, -122.3877, { NBA: ['Golden State|Warriors'] });
addVenue('Toyota Center', 'Houston, TX', 29.7508, -95.3621, { NBA: ['Houston|Rockets'] });
addVenue('Gainbridge Fieldhouse', 'Indianapolis, IN', 39.764, -86.1555, { NBA: ['Indiana|Pacers'] }, ['Bankers Life Fieldhouse']);
addVenue('Intuit Dome', 'Inglewood, CA', 33.9958, -118.3419, { NBA: ['Los Angeles|Clippers'] });
addVenue('Crypto.com Arena', 'Los Angeles, CA', 34.043, -118.2673, { NBA: ['Los Angeles|Lakers'], NHL: ['Los Angeles|Kings'] }, ['Staples Center']);
addVenue('FedExForum', 'Memphis, TN', 35.1382, -90.0505, { NBA: ['Memphis|Grizzlies'] });
addVenue('Kaseya Center', 'Miami, FL', 25.7814, -80.187, { NBA: ['Miami|Heat'] }, ['FTX Arena', 'American Airlines Arena']);
addVenue('Fiserv Forum', 'Milwaukee, WI', 43.0451, -87.9174, { NBA: ['Milwaukee|Bucks'] });
addVenue('Target Center', 'Minneapolis, MN', 44.9795, -93.2761, { NBA: ['Minnesota|Timberwolves', 'Minnesota|Wolves'] });
addVenue('Smoothie King Center', 'New Orleans, LA', 29.949, -90.0821, { NBA: ['New Orleans|Pelicans'] });
addVenue('Madison Square Garden', 'New York, NY', 40.7505, -73.9934, { NBA: ['New York|Knicks'], NHL: ['New York|Rangers'] }, ['MSG']);
addVenue('Paycom Center', 'Oklahoma City, OK', 35.4634, -97.5151, { NBA: ['Oklahoma City|Thunder'] });
addVenue('Kia Center', 'Orlando, FL', 28.5392, -81.3839, { NBA: ['Orlando|Magic'] }, ['Amway Center']);
addVenue('Wells Fargo Center', 'Philadelphia, PA', 39.9012, -75.172, { NBA: ['Philadelphia|76ers', 'Philadelphia|Sixers'], NHL: ['Philadelphia|Flyers'] });
addVenue('Mortgage Matchup Center', 'Phoenix, AZ', 33.4457, -112.0712, { NBA: ['Phoenix|Suns'] }, ['Footprint Center', 'PHX Arena', 'Talking Stick Resort Arena']);
addVenue('Moda Center', 'Portland, OR', 45.5316, -122.6668, { NBA: ['Portland|Trail Blazers', 'Portland|Blazers'] });
addVenue('Golden 1 Center', 'Sacramento, CA', 38.5802, -121.4997, { NBA: ['Sacramento|Kings'] });
addVenue('Frost Bank Center', 'San Antonio, TX', 29.427, -98.4375, { NBA: ['San Antonio|Spurs'] }, ['AT&T Center']);
addVenue('Scotiabank Arena', 'Toronto, ON', 43.6435, -79.3791, { NBA: ['Toronto|Raptors'], NHL: ['Toronto|Maple Leafs'] }, ['Air Canada Centre']);
addVenue('Delta Center', 'Salt Lake City, UT', 40.7683, -111.9011, { NBA: ['Utah|Jazz'], NHL: ['Utah|Mammoth', 'Utah|Hockey Club'] }, ['Vivint Arena']);
addVenue('Capital One Arena', 'Washington, DC', 38.8981, -77.0209, { NBA: ['Washington|Wizards'], NHL: ['Washington|Capitals'] });
addVenue('Honda Center', 'Anaheim, CA', 33.8078, -117.8765, { NHL: ['Anaheim|Ducks'] });
addVenue('KeyBank Center', 'Buffalo, NY', 42.875, -78.8765, { NHL: ['Buffalo|Sabres'] });
addVenue('Scotiabank Saddledome', 'Calgary, AB', 51.0374, -114.0519, { NHL: ['Calgary|Flames'] });
addVenue('Lenovo Center', 'Raleigh, NC', 35.8033, -78.722, { NHL: ['Carolina|Hurricanes'] }, ['PNC Arena']);
addVenue('Nationwide Arena', 'Columbus, OH', 39.9693, -83.0061, { NHL: ['Columbus|Blue Jackets'] });
addVenue('Rogers Place', 'Edmonton, AB', 53.5469, -113.4979, { NHL: ['Edmonton|Oilers'] });
addVenue('Amerant Bank Arena', 'Sunrise, FL', 26.1584, -80.3256, { NHL: ['Florida|Panthers'] }, ['FLA Live Arena', 'BB&T Center']);
addVenue('Xcel Energy Center', 'St. Paul, MN', 44.9447, -93.101, { NHL: ['Minnesota|Wild'] });
addVenue('Bell Centre', 'Montreal, QC', 45.4961, -73.5693, { NHL: ['Montreal|Canadiens'] });
addVenue('Bridgestone Arena', 'Nashville, TN', 36.1592, -86.7785, { NHL: ['Nashville|Predators'] });
addVenue('Prudential Center', 'Newark, NJ', 40.7334, -74.1712, { NHL: ['New Jersey|Devils'] });
addVenue('UBS Arena', 'Elmont, NY', 40.7117, -73.726, { NHL: ['New York|Islanders'] });
addVenue('Canadian Tire Centre', 'Ottawa, ON', 45.2969, -75.9272, { NHL: ['Ottawa|Senators'] });
addVenue('PPG Paints Arena', 'Pittsburgh, PA', 40.4395, -79.9892, { NHL: ['Pittsburgh|Penguins'] });
addVenue('SAP Center', 'San Jose, CA', 37.3328, -121.9012, { NHL: ['San Jose|Sharks'] });
addVenue('Climate Pledge Arena', 'Seattle, WA', 47.6221, -122.354, { NHL: ['Seattle|Kraken'] }, ['KeyArena']);
addVenue('Enterprise Center', 'St. Louis, MO', 38.6268, -90.2026, { NHL: ['St. Louis|Blues', 'St Louis|Blues'] }, ['Scottrade Center']);
addVenue('Amalie Arena', 'Tampa, FL', 27.9427, -82.4518, { NHL: ['Tampa Bay|Lightning'] });
addVenue('Rogers Arena', 'Vancouver, BC', 49.2778, -123.1089, { NHL: ['Vancouver|Canucks'] });
addVenue('T-Mobile Arena', 'Las Vegas, NV', 36.1029, -115.1784, { NHL: ['Vegas|Golden Knights', 'Las Vegas|Golden Knights'] });
addVenue('Canada Life Centre', 'Winnipeg, MB', 49.8928, -97.1436, { NHL: ['Winnipeg|Jets'] }, ['Bell MTS Place']);

// College football: Power 4 conferences (Pitt and Miami share NFL stadiums above)
addVenue('Bryant-Denny Stadium', 'Tuscaloosa, AL', 33.2084, -87.5503, { 'College Football': ['Alabama|Crimson Tide'] });
addVenue('Razorback Stadium', 'Fayetteville, AR', 36.0682, -94.1789, { 'College Football': ['Arkansas|Razorbacks'] }, ['Donald W. Reynolds Razorback Stadium']);
addVenue('Jordan-Hare Stadium', 'Auburn, AL', 32.6023, -85.4897, { 'College Football': ['Auburn|Tigers'] });
addVenue('Ben Hill Griffin Stadium', 'Gainesville, FL', 29.65, -82.3486, { 'College Football': ['Florida|Gators'] }, ['The Swamp']);
addVenue('Sanford Stadium', 'Athens, GA', 33.95, -83.3733, { 'College Football': ['Georgia|Bulldogs'] });
addVenue('Kroger Field', 'Lexington, KY', 38.0221, -84.505, { 'College Football': ['Kentucky|Wildcats'] }, ['Commonwealth Stadium']);
addVenue('Tiger Stadium', 'Baton Rouge, LA', 30.412, -91.1838, { 'College Football': ['LSU|Tigers'] }, ['Death Valley']);
addVenue('Davis Wade Stadium', 'Starkville, MS', 33.456, -88.7942, { 'College Football': ['Mississippi State|Bulldogs'] });
addVenue('Faurot Field', 'Columbia, MO', 38.936, -92.333, { 'College Football': ['Missouri|Tigers'] }, ['Memorial Stadium (Missouri)']);
addVenue('Gaylord Family Oklahoma Memorial Stadium', 'Norman, OK', 35.2058, -97.4423, { 'College Football': ['Oklahoma|Sooners'] }, ['Oklahoma Memorial Stadium']);
addVenue('Vaught-Hemingway Stadium', 'Oxford, MS', 34.3623, -89.5342, { 'College Football': ['Ole Miss|Rebels', 'Mississippi|Rebels'] });
addVenue('Williams-Brice Stadium', 'Columbia, SC', 33.9728, -81.0192, { 'College Football': ['South Carolina|Gamecocks'] });
addVenue('Neyland Stadium', 'Knoxville, TN', 35.955, -83.925, { 'College Football': ['Tennessee|Volunteers', 'Tennessee|Vols'] });
addVenue('Darrell K Royal-Texas Memorial Stadium', 'Austin, TX', 30.2837, -97.7326, { 'College Football': ['Texas|Longhorns'] }, ['DKR', 'Texas Memorial Stadium']);
addVenue('Kyle Field', 'College Station, TX', 30.61, -96.34, { 'College Football': ['Texas A&M|Aggies'] });
addVenue('FirstBank Stadium', 'Nashville, TN', 36.144, -86.8115, { 'College Football': ['Vanderbilt|Commodores'] }, ['Vanderbilt Stadium']);

addVenue('Memorial Stadium (Champaign)', 'Champaign, IL', 40.0992, -88.236, { 'College Football': ['Illinois|Fighting Illini', 'Illinois|Illini'] }, ['Illinois Memorial Stadium']);
addVenue('Memorial Stadium (Bloomington)', 'Bloomington, IN', 39.1807, -86.5258, { 'College Football': ['Indiana|Hoosiers'] }, ['Indiana Memorial Stadium']);
addVenue('Kinnick Stadium', 'Iowa City, IA', 41.6586, -91.5511, { 'College Football': ['Iowa|Hawkeyes'] });
addVenue('SECU Stadium', 'College Park, MD', 38.99, -76.9475, { 'College Football': ['Maryland|Terrapins', 'Maryland|Terps'] }, ['Capital One Field', 'Maryland Stadium']);
addVenue('Michigan Stadium', 'Ann Arbor, MI', 42.2658, -83.7487, { 'College Football': ['Michigan|Wolverines'] }, ['The Big House']);
addVenue('Spartan Stadium', 'East Lansing, MI', 42.7285, -84.4846, { 'College Football': ['Michigan State|Spartans'] });
addVenue('Huntington Bank Stadium', 'Minneapolis, MN', 44.9765, -93.2245, { 'College Football': ['Minnesota|Golden Gophers', 'Minnesota|Gophers'] }, ['TCF Bank Stadium']);
addVenue('Memorial Stadium (Lincoln)', 'Lincoln, NE', 40.8206, -96.7056, { 'College Football': ['Nebraska|Cornhuskers', 'Nebraska|Huskers'] }, ['Nebraska Memorial Stadium']);
addVenue('Ryan Field', 'Evanston, IL', 42.065, -87.6926, { 'College Football': ['Northwestern|Wildcats'] });
addVenue('Ohio Stadium', 'Columbus, OH', 40.0017, -83.0197, { 'College Football': ['Ohio State|Buckeyes'] }, ['The Horseshoe', 'The Shoe']);
addVenue('Autzen Stadium', 'Eugene, OR', 44.0582, -123.0685, { 'College Football': ['Oregon|Ducks'] });
addVenue('Beaver Stadium', 'University Park, PA', 40.8122, -77.8561, { 'College Football': ['Penn State|Nittany Lions'] });
addVenue('Ross-Ade Stadium', 'West Lafayette, IN', 40.4345, -86.9186, { 'College Football': ['Purdue|Boilermakers'] });
addVenue('SHI Stadium', 'Piscataway, NJ', 40.5136, -74.4656, { 'College Football': ['Rutgers|Scarlet Knights'] }, ['High Point Solutions Stadium']);
addVenue('Rose Bowl', 'Pasadena, CA', 34.1613, -118.1676, { 'College Football': ['UCLA|Bruins'] }, ['Rose Bowl Stadium']);
addVenue('Los Angeles Memorial Coliseum', 'Los Angeles, CA', 34.0141, -118.2879, { 'College Football': ['USC|Trojans', 'Southern California|Trojans'] }, ['LA Coliseum', 'Memorial Coliseum']);
addVenue('Husky Stadium', 'Seattle, WA', 47.6502, -122.3016, { 'College Football': ['Washington|Huskies'] }, ['Alaska Airlines Field at Husky Stadium']);
addVenue('Camp Randall Stadium', 'Madison, WI', 43.07, -89.4125, { 'College Football': ['Wisconsin|Badgers'] });

addVenue('Arizona Stadium', 'Tucson, AZ', 32.2288, -110.9489, { 'College Football': ['Arizona|Wildcats'] });
addVenue('Mountain America Stadium', 'Tempe, AZ', 33.4265, -111.9325, { 'College Football': ['Arizona State|Sun Devils'] }, ['Sun Devil Stadium']);
addVenue('McLane Stadium', 'Waco, TX', 31.5585, -97.115, { 'College Football': ['Baylor|Bears'] });
addVenue('LaVell Edwards Stadium', 'Provo, UT', 40.2575, -111.6544, { 'College Football': ['BYU|Cougars', 'Brigham Young|Cougars'] });
addVenue('Nippert Stadium', 'Cincinnati, OH', 39.1312, -84.5167, { 'College Football': ['Cincinnati|Bearcats'] });
addVenue('Folsom Field', 'Boulder, CO', 40.0095, -105.2668, { 'College Football': ['Colorado|Buffaloes', 'Colorado|Buffs'] });
addVenue('TDECU Stadium', 'Houston, TX', 29.7226, -95.3487, { 'College Football': ['Houston|Cougars'] });
addVenue('Jack Trice Stadium', 'Ames, IA', 42.0141, -93.6362, { 'College Football': ['Iowa State|Cyclones'] });
addVenue('David Booth Kansas Memorial Stadium', 'Lawrence, KS', 38.9632, -95.2466, { 'College Football': ['Kansas|Jayhawks'] }, ['Kansas Memorial Stadium']);
addVenue('Bill Snyder Family Stadium', 'Manhattan, KS', 39.2022, -96.5937, { 'College Football': ['Kansas State|Wildcats', 'K-State|Wildcats'] });
addVenue('Boone Pickens Stadium', 'Stillwater, OK', 36.1264, -97.0659, { 'College Football': ['Oklahoma State|Cowboys'] });
addVenue('Amon G. Carter Stadium', 'Fort Worth, TX', 32.7098, -97.3678, { 'College Football': ['TCU|Horned Frogs', 'Texas Christian|Horned Frogs'] });
addVenue('Jones AT&T Stadium', 'Lubbock, TX', 33.5906, -101.8727, { 'College Football': ['Texas Tech|Red Raiders'] }, ['Jones Stadium']);
addVenue('Acrisure Bounce House', 'Orlando, FL', 28.6082, -81.1925, { 'College Football': ['UCF|Knights', 'Central Florida|Knights'] }, ['FBC Mortgage Stadium', 'Bounce House']);
addVenue('Rice-Eccles Stadium', 'Salt Lake City, UT', 40.76, -111.8488, { 'College Football': ['Utah|Utes'] });
addVenue('Milan Puskar Stadium', 'Morgantown, WV', 39.65, -79.955, { 'College Football': ['West Virginia|Mountaineers'] }, ['Mountaineer Field']);

addVenue('Alumni Stadium', 'Chestnut Hill, MA', 42.3355, -71.1665, { 'College Football': ['Boston College|Eagles'] });
addVenue('California Memorial Stadium', 'Berkeley, CA', 37.8715, -122.2509, { 'College Football': ['California|Golden Bears', 'Cal|Golden Bears'] }, ['Cal Memorial Stadium']);
addVenue('Memorial Stadium (Clemson)', 'Clemson, SC', 34.6786, -82.843, { 'College Football': ['Clemson|Tigers'] }, ['Death Valley (Clemson)']);
addVenue('Wallace Wade Stadium', 'Durham, NC', 35.9975, -78.9425, { 'College Football': ['Duke|Blue Devils'] });
addVenue('Doak Campbell Stadium', 'Tallahassee, FL', 30.4383, -84.3042, { 'College Football': ['Florida State|Seminoles', 'FSU|Seminoles'] });
addVenue('Bobby Dodd Stadium', 'Atlanta, GA', 33.7724, -84.3928, { 'College Football': ['Georgia Tech|Yellow Jackets'] }, ['Bobby Dodd Stadium at Hyundai Field']);
addVenue('L&N Federal Credit Union Stadium', 'Louisville, KY', 38.2062, -85.7586, { 'College Football': ['Louisville|Cardinals'] }, ['Cardinal Stadium', 'Papa John\'s Cardinal Stadium']);
addVenue('Carter-Finley Stadium', 'Raleigh, NC', 35.8008, -78.7192, { 'College Football': ['NC State|Wolfpack', 'North Carolina State|Wolfpack'] });
addVenue('Kenan Memorial Stadium', 'Chapel Hill, NC', 35.9072, -79.0476, { 'College Football': ['North Carolina|Tar Heels', 'UNC|Tar Heels'] }, ['Kenan Stadium']);
addVenue('Notre Dame Stadium', 'Notre Dame, IN', 41.6985, -86.234, { 'College Football': ['Notre Dame|Fighting Irish'] });
addVenue('Gerald J. Ford Stadium', 'University Park, TX', 32.8398, -96.7824, { 'College Football': ['SMU|Mustangs', 'Southern Methodist|Mustangs'] });
addVenue('Stanford Stadium', 'Stanford, CA', 37.4346, -122.1609, { 'College Football': ['Stanford|Cardinal'] });
addVenue('JMA Wireless Dome', 'Syracuse, NY', 43.0362, -76.1364, { 'College Football': ['Syracuse|Orange'] }, ['Carrier Dome']);
addVenue('Scott Stadium', 'Charlottesville, VA', 38.0289, -78.5139, { 'College Football': ['Virginia|Cavaliers', 'Virginia|Hoos'] });
addVenue('Lane Stadium', 'Blacksburg, VA', 37.22, -80.418, { 'College Football': ['Virginia Tech|Hokies'] });
addVenue('Allegacy Federal Credit Union Stadium', 'Winston-Salem, NC', 36.13, -80.2557, { 'College Football': ['Wake Forest|Demon Deacons'] }, ['Truist Field', 'BB&T Field']);

// NASCAR tracks on the Cup Series schedule
addVenue('Daytona International Speedway', 'Daytona Beach, FL', 29.1852, -81.0705, {}, ['Daytona']);
addVenue('EchoPark Speedway', 'Hampton, GA', 33.3846, -84.3167, {}, ['Atlanta Motor Speedway', 'Atlanta Speedway']);
addVenue('Circuit of the Americas', 'Austin, TX', 30.1328, -97.6411, {}, ['COTA']);
addVenue('Phoenix Raceway', 'Avondale, AZ', 33.3764, -112.3113, {}, ['ISM Raceway']);
addVenue('Las Vegas Motor Speedway', 'Las Vegas, NV', 36.2722, -115.0101);
addVenue('Homestead-Miami Speedway', 'Homestead, FL', 25.4517, -80.4086, {}, ['Homestead Miami Speedway']);
addVenue('Martinsville Speedway', 'Martinsville, VA', 36.6342, -79.8517);
addVenue('Darlington Raceway', 'Darlington, SC', 34.2942, -79.9055);
addVenue('Bristol Motor Speedway', 'Bristol, TN', 36.5156, -82.257);
addVenue('Kansas Speedway', 'Kansas City, KS', 39.1157, -94.8311);
addVenue('Talladega Superspeedway', 'Talladega, AL', 33.5671, -86.0657, {}, ['Talladega']);
addVenue('Texas Motor Speedway', 'Fort Worth, TX', 33.0372, -97.2819);
addVenue('Watkins Glen International', 'Watkins Glen, NY', 42.3369, -76.9272, {}, ['Watkins Glen']);
addVenue('Charlotte Motor Speedway', 'Concord, NC', 35.3519, -80.6828);
addVenue('Nashville Superspeedway', 'Lebanon, TN', 36.0445, -86.4017);
addVenue('Michigan International Speedway', 'Brooklyn, MI', 42.0678, -84.242);
addVenue('Pocono Raceway', 'Long Pond, PA', 41.0555, -75.5114);
addVenue('Indianapolis Motor Speedway', 'Speedway, IN', 39.795, -86.2353, {}, ['Brickyard']);
addVenue('Richmond Raceway', 'Richmond, VA', 37.5919, -77.4192);
addVenue('New Hampshire Motor Speedway', 'Loudon, NH', 43.3628, -71.4603);
addVenue('Iowa Speedway', 'Newton, IA', 41.6777, -93.0112);
addVenue('Sonoma Raceway', 'Sonoma, CA', 38.1608, -122.4548);
addVenue('Chicago Street Course', 'Chicago, IL', 41.8756, -87.619);
addVenue('World Wide Technology Raceway', 'Madison, IL', 38.6506, -90.1366, {}, ['Gateway Motorsports Park']);
addVenue('Dover Motor Speedway', 'Dover, DE', 39.1901, -75.5309, {}, ['Dover International Speedway']);
addVenue('Road America', 'Elkhart Lake, WI', 43.7978, -87.9899);
addVenue('North Wilkesboro Speedway', 'North Wilkesboro, NC', 36.1294, -81.0996);
addVenue('Los Angeles Memorial Coliseum', 'Los Angeles, CA', 34.0141, -118.2879);
addVenue('Autodromo Hermanos Rodriguez', 'Mexico City, Mexico', 19.4042, -99.0907);

// International and neutral sites
addVenue('Aviva Stadium', 'Dublin, Ireland', 53.3351, -6.2285, {}, ['Lansdowne Road']);
addVenue('Croke Park', 'Dublin, Ireland', 53.3607, -6.2512);
addVenue('Wembley Stadium', 'London, England', 51.556, -0.2795);
addVenue('Tottenham Hotspur Stadium', 'London, England', 51.6043, -0.0664);
addVenue('Estadio Azteca', 'Mexico City, Mexico', 19.3029, -99.1505, {}, ['Estadio Banorte', 'Azteca']);
