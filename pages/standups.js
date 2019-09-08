/* eslint-env browser */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getStandups } from '../api';
import moment from 'moment';
import nl2br from 'react-nl2br';
import emoji from 'node-emoji';
import Linkify from 'react-linkify';
import Link from 'next/link';
import {
  Button,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@material-ui/core';
import Layout from '../components/layout';
import MuiLink from '@material-ui/core/Link';

moment.updateLocale('en', {
  week: {
    dow: 1, // First day of week is Monday
  },
});

const GROUPINGS = {
  day: 'day',
  progress: 'progress',
};

function getUsersFromStandups(standups, numDays) {
  let usersIndex = standups.reduce((acc, standup) => {
    acc[standup.username] = {
      username: standup.username,
      real_name: standup.real_name,
      avatar_url: standup.avatar_url,
      standups: new Array(numDays).fill(),
    };

    return acc;
  }, {});

  return usersIndex;
}

function getDatesArray(dateFrom, dateTo) {
  let numDays = dateTo.diff(dateFrom, 'days') + 1;
  let dates = new Array(numDays).fill().map((_, i) => {
    return dateFrom.clone().add(i, 'days');
  });

  return dates;
}

function getTableData(raw, dates) {
  let users = getUsersFromStandups(raw, dates.length);

  raw.forEach(standup => {
    let i = moment(standup.date).diff(dates[0], 'days');
    users[standup.username].standups[i] = standup;
  });

  return Object.keys(users).map(username => users[username]);
}

const EmptyStandup = () => {
  return <h4 style={{ color: '#aaa' }}>No entry today</h4>;
};
const Standup = ({ prev_day, day, blocker, next, grouping }) => {
  if (!prev_day && !day & !blocker) return <EmptyStandup />;

  const onMissing = name =>
    name === 'tick' ? emoji.emojify(':white_check_mark:') : `:${name}:`;
  const formatText = s =>
    s ? <Linkify>{nl2br(emoji.emojify(s, onMissing))}</Linkify> : null;

  if (grouping == GROUPINGS.day) {
    return (
      <div>
        <h4>Previous day:</h4>
        <p>{formatText(prev_day) || '-'}</p>

        <h4>Today:</h4>
        <p>{formatText(day) || '-'}</p>

        <h4>Blockers:</h4>
        <p>{formatText(blocker) || '-'}</p>
      </div>
    );
  } else if (grouping == GROUPINGS.progress) {
    return (
      <div>
        <h4>Today planned:</h4>
        <p>{formatText(day) || '-'}</p>

        <h4>Today actual:</h4>
        <p>
          {(next && next.prev_day ? formatText(next.prev_day) : '-') || '-'}
        </p>
      </div>
    );
  }
};

const User = ({ avatar_url, username, real_name }) => {
  return (
    <span>
      <h4>{real_name}</h4>
      <img src={avatar_url} />
    </span>
  );
};

const DateTh = ({ date }) => (
  <TableCell className="date-th">
    <style jsx global>
      {`
        .date-th {
          width: 18%;
        }
      `}
    </style>
    <h4>{date.format('dddd')}</h4>
    <p>{date.format('DD MMM YYYY')}</p>
  </TableCell>
);

const Standups = () => {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);

  const router = useRouter();
  let { weekDif, grouping } = router.query;

  grouping = grouping || GROUPINGS.day;
  weekDif = +weekDif || 0;

  useEffect(() => {
    async function fetchData() {
      if (!window.localStorage.getItem('token')) {
        window.location.href = '/';
        return;
      }

      const dateFrom = moment()
        .utc()
        .add(weekDif, 'weeks')
        .startOf('week');
      const dateTo = moment()
        .utc()
        .add(weekDif, 'weeks')
        .endOf('week')
        .day(-2);

      let data = await getStandups(dateFrom, dateTo);
      let datesArray = getDatesArray(dateFrom, dateTo);
      setDates(datesArray);
      setData(getTableData(data.standups, datesArray));
    }

    fetchData();
  }, [weekDif]);

  return (
    <Layout inApp={true}>
      <Grid container>
        <Grid item xs={6} style={{ textAlign: 'left', marginBottom: 6 }}>
          <Link href={{ query: { ...router.query, weekDif: weekDif - 1 } }}>
            <Button variant="outlined" size="small">
              &lt; Prev week
            </Button>
          </Link>
        </Grid>
        <Grid item xs={6} style={{ textAlign: 'right' }}>
          <Link href={{ query: { ...router.query, weekDif: weekDif + 1 } }}>
            <Button variant="outlined" size="small">
              Next week &gt;
            </Button>
          </Link>
        </Grid>
      </Grid>
      <div>
        <style jsx global>
          {`
            html,
            body {
              margin: 0;
              padding: 0;
              background: #fefefe;
            }

            html .MuiToggleButton-root,
            html .MuiButton-root {
              color: rgba(0, 0, 0, 0.67);
              background: white;
            }

            .standups-table {
              border-collapse: collapse;
              border: 1px solid #dfdfdf;
              background: white;
            }

            .standups-table td {
              vertical-align: top;
            }

            .standups-table tr:nth-child(2n) td {
              background: #f4f4f4;
            }
          `}
        </style>
        <Table stickyHeader={true} className="standups-table">
          <TableHead>
            <TableRow>
              <TableCell>Users</TableCell>
              {dates.map(date => (
                <DateTh date={date} />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(user => (
              <TableRow>
                <TableCell>
                  <User {...user} />
                </TableCell>
                {user.standups.map((standup, i) => (
                  <TableCell>
                    <Standup
                      {...standup}
                      next={user.standups[i + 1]}
                      grouping={grouping}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
};

Standups.getInitialProps = async () => {
  return {};
};

export default Standups;
