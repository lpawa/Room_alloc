/**
 * Created by lakshya on 3/28/18.
 */
const pg = require('pg');
// const url=require('url');
//
const conString = '' ;// make sure to match your own database's credentials
//
// const params = url.parse(conString);
// const auth = params.auth.split(':');

pg.defaults.ssl = true;
// /var client = new Client({user: 'lakshya', database: 'hotel'});

// const config = {
//     user: auth[0],
//     password: auth[1],
//     host: params.hostname,
//     port: params.port,
//     database: params.pathname.split('/')[1],
//     ssl: true
// };

var config2 = {
    user: 'postgres', //env var: PGUSER
    database: 'hotel', //env var: PGDATABASE
    password: 'abc', //env var: PGPASSWORD
    host: 'localhost', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config2);

    // pg.connect(conString, function (err, client, done) {
    //     if (err) {
    //         return console.error('error fetching client from pool', err)
    //     }
    //     let links=[];
    //     client.query('SELECT * from link', function (err, result) {
    //         done()
    //
    //         if (err) {
    //             return console.error('error happened during query', err)
    //         }
    //         for(row of result.rows) {
    //             links.push({
    //               link:row.links
    //             })
    //         }
    //         cb(links);
    //
    //
    //     })
    // })
// }
function getInfo(cb,obj) {

    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        console.log('Connected to postgres! Getting schemas...');
        let data=[];

        let query= "SELECT * from room WHERE DATE_PART('month',id) = " + obj.month + " AND DATE_PART('year',id) = "+obj.year+" ORDER BY id;";
        console.log(query);
        client.query(query, function (err, result) {
            done();

            if (err) {
                return console.error('error happened during query', err)
            }
            // console.log(result);
            console.log(result.rowCount);
            for(row of result.rows) {
                data.push({
                    Date:row.id,
                    Double_price:row.double_price,
                    Double_occupancy:row.double_occupancy,
                    Single_price:row.single_price,
                    Single_occupancy:row.single_occupancy,
                    Day:row.day
                });

            }

            //console.log("data:-"+data);
            cb(data);
        });
    });
}
function bulkQueryBuilder(data) {
    var query1 = "UPDATE room SET ";
    if(data.type=="single"){
        if(data.price){
            query1+= "single_price = " + data.price;
            if(data.availability){
               query1+=" , "
            }
        }
        if(data.availability){
            let occ = 5-data.availability;
            query1+= " single_occupancy = " + occ;
        }
    }
    else if(data.type=="double"){
        if(data.price){
            query1+= "double_price = " + data.price;
            if(data.availability){
                query1+=" , "
            }
        }
        if(data.availability){
            let occ = 5-data.availability;
            query1+= " double_occupancy = " + occ;
        }
    }
    query2 = " WHERE id BETWEEN ";
    query2+=" '" + data.start_date + "' AND '" + data.end_date + "' " ;
    query3 = " ;";
    if(data.days) {
        let days = new Array(8).fill(0);
        for(var i=0;i<data.days.length;i++){
            if(data.days[i]==8 || data.days==8){
                days.fill(1);
                break;
            }
            else if(data.days[i]==9 || data.days==8){
                days[5]=1;
                days[6]=1;
                days[7]=1;
            }
            else if(data.days[i]==10 || data.days==10){
                days[1]=1;
                days[2]=1;
                days[3]=1;
                days[4]=1;
            }
            else if((data.days[i]>=1 && data.days[i]<=7) || (data.days>=1 && data.days[i]<=7) ){
                if(data.days[i]) {
                    days[data.days[i]] = 1;
                }
                else{
                    days[data.days] = 1;
                }
            }
            console.log(days);
        }


        query3 = "AND day IN (";
        for(i=1;i<8;i++){
            if(days[i]==1){
                   query3+=i + ","
            }
        }
        query3=query3.substring(0,query3.length-1);
        query3+=" );";
    }
    var query = query1+query2+query3;
    return query;
}
function singlequeryBuilder(data){
    var query1 = "UPDATE room SET ";
    var query2 = " WHERE id";
    if(data.type=="single"){
        if(data.price){
            query1+= "single_price = " + data.price;
        }
        else if(data.availability){
            let occ = 5-data.availability;
            query1+= "single_occupancy = " + occ;
        }


    }
    else if(data.type=="double"){
        if(data.price){
            query1+= "double_price = " + data.price;
        }
        else if(data.availability){
            let occ = 5-data.availability;
            query1+= "double_occupancy = " + occ;
        }
    }

    if(data.date){
        query2+="= '" + data.date + "';";
    }
    var query = query1+query2;
    return query;
}
function AlterData(cb,data) {
    let query;
    console.log(data);
    if(data.operation=="bulk"){
        query=bulkQueryBuilder(data);
    }
    else if (data.operation=="single"){
        query=singlequeryBuilder(data);
        // console.log(query);
        // cb();
        //build single query
    }
    console.log(query);
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        console.log('Connected to postgres! Getting schemas...');
        client.query(query, function (err, result) {
            done();

            if (err) {
                return console.error('error happened during query', err)
            }
            //console.log("data:-"+data);
            cb(result);
        });
    });

}

// function DeleteID(cb,id) {
//
//     pool.connect(function(err, client, done) {
//         if(err) {
//             return console.error('error fetching client from pool', err);
//         }
//         console.log('Connected to postgres! Getting schemas...');
//         let query = "DELETE from designerdata WHERE id =" + id + ";";
//         console.log(query);
//         client.query(query, function (err, result) {
//             done();
//
//             if (err) {
//                 return console.error('error happened during query', err)
//             }
//             // for(row of result.rows) {
//             //     data.push({
//             //         Id:row.id,
//             //         Work:row.work,
//             //         Url:row.url,
//             //         Experience: row.experience,
//             //         Status: row.status,
//             //         Email:row.email
//             //     });
//             //     console.log("Data sent");
//             //     console.log(row);
//             // }
//             // console.log("links:-"+links);
//             cb();
//         });
//     });
// }

module.exports={
    getInfo : getInfo,
    AlterData:AlterData
};