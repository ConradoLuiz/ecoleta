import { Request, Response, NextFunction } from 'express';
import knex from '../database/connection';

class ItemsController {
    
    async index(req: Request, res: Response, next: NextFunction) {
        const items = await knex('items').select('*');

        const serializedItems = items.map(item => {
            return {
             ...item,
             image_url: `http://192.168.15.7:5000/uploads/${item.image}`   
            }
        }); 
        return res.json({
            items: serializedItems
        });
    }
}


export default ItemsController; 