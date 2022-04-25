import { useEffect, useState } from 'react'
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function TPEContent(props) {
  const [dataList, setDataList] = useState('') //取得台北市資料
  const [districtList, setDistrictList] = useState([]) //取得台北市行政區list
  const [districtSum, setDistrictSum] = useState({}) //取得資料總和
  const [district, setDistrict] = useState('') //取得所選行政區
  const [villageList, setVillageList] = useState('') //取得該行政區鄉里list

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        // enabled: false,
      },
      datalabels: {
        font: {
          size: 12,
        },
        anchor: 'end',
        align: 'end',
        color: 'gray',
        weight: 'bold',
        formatter: function (value, context) {
          if (value) {
            return value + '人'
          }
        },
      },
    },
  }

  const labels = ['共同生活戶', '獨立生活戶']

  const data = {
    label: '台北市人口分布',
    labels,
    datasets: [
      {
        label: '男生',
        data: [districtSum.districtOrdMSum, districtSum.districtSinMSum],
        backgroundColor: ['rgb(71, 161, 225)'],
      },
      {
        label: '女生',
        data: [districtSum.districtOrdFSum, districtSum.districtSinFSum],
        backgroundColor: ['#EB7A77'],
      },
    ],
  }

  useEffect(() => {
    fetch('https://www.ris.gov.tw/rs-opendata/api/v1/datastore/ODRP019/106')
      .then((r) => r.json())
      .then((data) => {
        console.log(data.responseData)
        const taipeiData = data.responseData.filter((v, i) => {
          return v.site_id.includes('臺北市')
        })
        const taipeiDistrict = []
        taipeiData.forEach((v, i) => {
          if (!taipeiDistrict.includes(v.site_id.slice(3))) {
            taipeiDistrict.push(v.site_id.slice(3))
          }
        })

        setDistrictList(taipeiDistrict)
        console.log('taipeiData', taipeiData)
        console.log(taipeiDistrict)
        setDataList(taipeiData)
      })
  }, [])

  function districtHandler(e) {
    let distirctSelected = e.target.value
    if (e.target.value === '全部鄉里') {
    //若選擇全部鄉里，設定distirctSelected為原行政區，去撈取全部資料
      distirctSelected = e.target.previousSibling.value
    }
    console.log(e.target.value)
    console.log(e)
    if (dataList) {
      setDistrict(e.target.value)
      console.log('district', district)
      console.log(e.target.value)
      const districtData = dataList.filter((v, i) => {
        return v.site_id.includes(distirctSelected)
      })

      const village = dataList.filter((v, i) => {
        return v.site_id.includes(distirctSelected)
      })

      const villageList = []
      village.forEach((e) => {
        villageList.push(e.village)
      })
      setVillageList(villageList)
      console.log(villageList)

      //選取行政區時，選擇鄉里的value便回'全部鄉里'
      e.target.nextSibling.value = '全部鄉里'

      console.log(districtData)
      const districtOrdF = []
      const districtOrdM = []
      const districtSinF = []
      const districtSinM = []
      districtData.forEach((e) => {
        districtOrdF.push(parseInt(e.household_ordinary_f))
        districtOrdM.push(parseInt(e.household_ordinary_m))
        districtSinF.push(parseInt(e.household_single_f))
        districtSinM.push(parseInt(e.household_single_m))
      })

      const districtOrdFSum = districtOrdF.reduce((a, b) => a + b)
      const districtOrdMSum = districtOrdM.reduce((a, b) => a + b)
      const districtSinFSum = districtSinF.reduce((a, b) => a + b)
      const districtSinMSum = districtSinM.reduce((a, b) => a + b)
      setDistrictSum({
        districtOrdFSum: districtOrdFSum,
        districtOrdMSum: districtOrdMSum,
        districtSinFSum: districtSinFSum,
        districtSinMSum: districtSinMSum,
      })
    }
  }

  function villageHandler(e) {
    if (e.target.value === '全部鄉里') {
      districtHandler(e)
    } else {
      console.log(e.target.value)
      const villageData = dataList.filter((v, i) => {
        return v.village.includes(e.target.value)
      })

      console.log('villageData', villageData)

      const districtOrdFSum = parseInt(villageData[0].household_ordinary_f)
      const districtOrdMSum = parseInt(villageData[0].household_ordinary_m)
      const districtSinFSum = parseInt(villageData[0].household_single_f)
      const districtSinMSum = parseInt(villageData[0].household_single_m)

      setDistrictSum({
        districtOrdFSum: districtOrdFSum,
        districtOrdMSum: districtOrdMSum,
        districtSinFSum: districtSinFSum,
        districtSinMSum: districtSinMSum,
      })
    }
  }
  return (
    <>
      <div className="content">
        <div className="district-select-area">
          <select name="" id="" onChange={(e) => districtHandler(e)}>
            <option>請選擇行政區</option>
            {districtList.map((v, i) => {
              return <option key={i}>{v}</option>
            })}
          </select>
          <select
            name=""
            id=""
            onChange={(e) => {
              villageHandler(e)
            }}
          >
            <option defaultValue="請選擇鄉里">請選擇鄉里</option>
            <option>全部鄉里</option>
            {villageList &&
              villageList.map((v, i) => {
                return <option key={i}>{v}</option>
              })}
          </select>
        </div>
        <Bar
          className="chart"
          options={options}
          data={data}
          plugins={[ChartDataLabels]}
        />
      </div>
    </>
  )
}

export default TPEContent
