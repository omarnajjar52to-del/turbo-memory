import {env} from 'cloudflare:workers';
import {handleClubRequest} from '../../../server/club-api.mjs';
export const dynamic='force-dynamic';
export const GET=(r:Request)=>handleClubRequest(r,env.DB);
export const POST=(r:Request)=>handleClubRequest(r,env.DB);
