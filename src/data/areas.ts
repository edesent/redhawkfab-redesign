/**
 * Service area — the Blue Water region and the drive-able Thumb / north Macomb
 * towns around the shop in Port Huron. `miles` is an approximate road distance
 * from Port Huron, rounded; `note` describes the place, never a job we did there.
 */
export type Area = {
  slug: string;
  name: string;
  county: string;
  miles: number;
  note: string;
  image: string;
};

export const AREAS: Area[] = [
  { slug: "port-huron", name: "Port Huron", county: "St. Clair", miles: 0, note: "Home base. The county seat at the foot of the Blue Water Bridge, where Lake Huron drains into the St. Clair River — and where our shop is.", image: "/industries/industrial.jpg" },
  { slug: "fort-gratiot", name: "Fort Gratiot", county: "St. Clair", miles: 5, note: "Directly north of the shop along the lakeshore and M-25, with the region's main retail corridor on 24th Avenue.", image: "/industries/automation.jpg" },
  { slug: "marysville", name: "Marysville", county: "St. Clair", miles: 7, note: "A working river town just south of Port Huron with an industrial waterfront along the St. Clair River.", image: "/industries/energy.jpg" },
  { slug: "kimball-township", name: "Kimball Township", county: "St. Clair", miles: 7, note: "West of the city along I-69, a mix of small industry, farms and the county's inland shops.", image: "/industries/prototype.jpg" },
  { slug: "st-clair", name: "St. Clair", county: "St. Clair", miles: 13, note: "Riverfront city downriver of Marysville, with a boardwalk on the St. Clair River and a long manufacturing history.", image: "/industries/rd.jpg" },
  { slug: "marine-city", name: "Marine City", county: "St. Clair", miles: 20, note: "A shipbuilding town by heritage on the St. Clair River, with a ferry to Ontario and a busy small-boat waterfront.", image: "/industries/agriculture.jpg" },
  { slug: "algonac", name: "Algonac", county: "St. Clair", miles: 26, note: "At the head of the St. Clair Flats, where the river opens into Lake St. Clair — boats, marinas and the work that keeps them running.", image: "/industries/industrial.jpg" },
  { slug: "yale", name: "Yale", county: "St. Clair", miles: 20, note: "A small city in the farm country northwest of Port Huron on M-19.", image: "/industries/agriculture.jpg" },
  { slug: "capac", name: "Capac", county: "St. Clair", miles: 27, note: "On I-69 at the west edge of the county, surrounded by row-crop and dairy farms.", image: "/industries/agriculture.jpg" },
  { slug: "memphis", name: "Memphis", county: "St. Clair / Macomb", miles: 22, note: "A village straddling the county line on M-19, with farm and small-shop work all around it.", image: "/industries/prototype.jpg" },
  { slug: "richmond", name: "Richmond", county: "Macomb", miles: 24, note: "Where Macomb County meets the Thumb — a rail town with an industrial park along Gratiot Avenue.", image: "/industries/industrial.jpg" },
  { slug: "lexington", name: "Lexington", county: "Sanilac", miles: 20, note: "The first harbor village up the Lake Huron shore on M-25, with orchards and farms inland.", image: "/industries/energy.jpg" },
  { slug: "croswell", name: "Croswell", county: "Sanilac", miles: 22, note: "Inland from Lexington in southern Sanilac County, home of the swinging bridge and a sugar-beet plant.", image: "/industries/agriculture.jpg" },
  { slug: "sandusky", name: "Sandusky", county: "Sanilac", miles: 35, note: "The Sanilac County seat, in the heart of Thumb farm country where equipment gets worked hard.", image: "/industries/agriculture.jpg" },
  { slug: "imlay-city", name: "Imlay City", county: "Lapeer", miles: 33, note: "On I-69 in eastern Lapeer County, with a solid base of manufacturing and farm-service businesses.", image: "/industries/automation.jpg" },
  { slug: "almont", name: "Almont", county: "Lapeer", miles: 33, note: "A village at the south edge of Lapeer County on M-53, between the farms of the Thumb and the shops of north Macomb.", image: "/industries/rd.jpg" },
  { slug: "lapeer", name: "Lapeer", county: "Lapeer", miles: 45, note: "The Lapeer County seat on I-69, with an established industrial park and a long manufacturing base.", image: "/industries/industrial.jpg" },
  { slug: "romeo", name: "Romeo", county: "Macomb", miles: 33, note: "A historic village on M-53 at the north end of Macomb County, with orchards to the east and industry to the south.", image: "/industries/prototype.jpg" },
  { slug: "new-baltimore", name: "New Baltimore", county: "Macomb", miles: 30, note: "On Anchor Bay at the north shore of Lake St. Clair, along the I-94 corridor.", image: "/industries/energy.jpg" },
  { slug: "chesterfield-township", name: "Chesterfield Township", county: "Macomb", miles: 33, note: "Fast-growing township on I-94 between New Baltimore and Mount Clemens, with light industry along the freeway.", image: "/industries/automation.jpg" },
  { slug: "macomb-township", name: "Macomb Township", county: "Macomb", miles: 38, note: "Suburban township in central Macomb County, next door to the automation and tooling shops of the M-59 corridor.", image: "/industries/automation.jpg" },
  { slug: "shelby-township", name: "Shelby Township", county: "Macomb", miles: 42, note: "On the M-59 corridor, one of the densest stretches of tooling, automation and machining shops in Michigan.", image: "/industries/rd.jpg" },
  { slug: "sterling-heights", name: "Sterling Heights", county: "Macomb", miles: 45, note: "Macomb County's largest city and a major manufacturing center along Van Dyke and Mound Road.", image: "/industries/industrial.jpg" },
  { slug: "clinton-township", name: "Clinton Township", county: "Macomb", miles: 42, note: "Michigan's largest township, on Gratiot and Groesbeck south of Mount Clemens, with a deep bench of industrial suppliers.", image: "/industries/prototype.jpg" },
];

export const AREA_BY_SLUG = Object.fromEntries(AREAS.map((a) => [a.slug, a])) as Record<string, Area>;

export const COUNTIES = ["St. Clair", "Sanilac", "Lapeer", "Macomb"] as const;

export function nearby(slug: string, n = 6): Area[] {
  const me = AREA_BY_SLUG[slug];
  return AREAS.filter((a) => a.slug !== slug)
    .sort((a, b) => Math.abs(a.miles - me.miles) - Math.abs(b.miles - me.miles))
    .slice(0, n);
}
