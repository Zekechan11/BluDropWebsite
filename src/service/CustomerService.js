export const CustomerService = {
    getData() {
        return [
            {
                id: 1000,
                representative: {
                    name: 'Ezekiel Angelo C. Pelayo',
                    image: 'ionibowcher.png'
                },
                area: 'Guadalupe, Bogo City, Cebu',
                date: '2015-09-13',
                status: 'This Week',
                collected: '200.00',
            },
           
            {
                id: 1002,
                representative: {
                    name: 'Karl Lawrenz Pino',
                    image: 'asiyajavayant.png'
                },
                area: '	Guadalupe, Bogo City, Cebu',
                date: '2017-05-13',
                status: 'This Month',
                collected: '10000.00',
            },
            {
                id: 1003,
                representative: {
                    name: 'Leonard Balabat',
                    image: 'xuxuefeng.png'
                },
                area: '	Nailon, Bogo City, Cebu',
                date: '2020-09-15',
                status: 'This Year',
                collected: '1500.00',
            }
        ];
    },


    getCustomersMedium() {
        return Promise.resolve(this.getData().slice(0, 50));
    },

    getCustomersLarge() {
        return Promise.resolve(this.getData().slice(0, 200));
    },
    
    getCustomers(params) {
        const queryParams = params
            ? Object.keys(params)
                  .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
                  .join('&')
            : '';

        return fetch('https://www.primefaces.org/data/customers?' + queryParams).then((res) => res.json());
    }
};