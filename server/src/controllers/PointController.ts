import { Request, Response, NextFunction } from 'express';
import knex from '../database/connection';
import Knex from 'knex';

class PointController {

    async index(req: Request, res: Response, next: NextFunction) {
        const { city, uf, items } = req.query;
        
        const parsedItems = String(items).split(',').map(item => Number(item.trim()) );

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id',  parsedItems )
            .orWhere('city', '=', String(city) )
            .orWhere('uf', '=', String(uf) )
            .distinct()
            .select('points.*');

        
        if (points.length == 0) {
            res.status(200);
            return res.json({message: 'No points were found with this filter'})
        }
        
        return res.json({
            points
        });
    }

    async show(req: Request, res: Response, next: NextFunction) {

        const { id } = req.params;

        if (!id) {
            res.status(400);
            return res.json({message: 'Id must be sent in request params'});
        }

        const point = await knex('points').where('id', '=', id).select('*').first();

        if (!point) {
            res.status(404);
            return res.json({message: 'Point not found'})
        }
        
        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        const serializedItems = items.map(item => {
            return {
                ...item,
                image_url: `http://192.168.15.7:5000/uploads/${item.image}`   
            }
        }); 
        return res.json({
            point,
            items: serializedItems
        });
    }

    async create(req: Request, res: Response, next: NextFunction) {
        
        const { 
            name, 
            email, 
            whatsapp, 
            latitude, 
            longitude, 
            city, 
            uf,
            items
        } = req.body;

        const newPoint = {
            name, 
            email, 
            whatsapp, 
            latitude, 
            longitude, 
            city, 
            uf,
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'
        }

        const trx = await knex.transaction();

        const newPointId = (await trx('points').insert(newPoint))[0];

        const pointItems = items.map( (item_id : Number) => {
            return {
                point_id: newPointId,
                item_id: item_id
            }
        });

        await trx('point_items').insert(pointItems)

        await trx.commit();

        res.status(201);
        return res.json({
            status: 'success',
            inserted_point: {id: newPointId, ...newPoint}
        });
    }
}

export default PointController; 