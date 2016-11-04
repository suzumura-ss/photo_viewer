const React = require('react');
const ReactDOM = require('react-dom');
const ExifReader = require(__dirname + '/js/exifreader');
const FS = require('fs');
const Sugar = require('Sugar');
Sugar.extend();

require(__dirname + '/js/fs-ext').extend(FS);

const {Image, Photo, Thumbnail, Preview} = require(__dirname + '/js/image');


class ImageCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {exif: {}};
    Image.findOrCreateWithFile(props.fileName).then((result)=>{
      const exif = result[0].dataValues,
            thumb = result[1].dataValues;
      exif.ThumbnailImage = thumb.Image;
      this.setState({exif: exif});
    });
  }

  render() {
    if (!this.state.exif.ThumbnailImage) {
      return (<div className='imageCell' />);
    }
    var klass = '';
    if (this.state.exif.Orientation) {
      klass = 'orientation-' + this.state.exif.Orientation.replace(/[()]/g, '').split(' ')[1];
    }
    return (
      <div className='imageCell'>
        <img className={klass} src={this.state.exif.ThumbnailImage} />
        <ImageCell.Exif exif={this.state.exif} />
      </div>
    );
  }
}


ImageCell.Exif = class extends React.Component {
  render() {
    const ExifProcs = {
      LensID:       (v)=>{ return v },
      FNumber:      (v)=>{ return 'F'+v },
      FocalLength:  (v)=>{ return v },
      ShutterSpeed: (v)=>{ return v },
      ISO:          (v)=>{ return 'ISO ' + v },
      ExposureCompensation: (v)=>{ return 'EV ' + parseFloat(v).toFixed(1) },
      DateTimeOriginal: (v)=>{ return v.toLocaleDateString() + ' ' + v.toLocaleTimeString() }
    }
    var elm = Object.keys(ExifProcs).map((key)=>{
      return (<li key={key} className={key}>{ExifProcs[key](this.props.exif[key])}</li>);
    });
    return (<ul>{elm}</ul>);
  }
}


class Images extends React.Component {
  constructor(props) {
    super(props);
    //this.state = {display: "LensID-hide FNumber-hide FocalLength-hide ShutterSpeed-hide ISO-hide ExposureCompensation-hide"};
    //this.state = {display: "ShutterSpeed-hide ISO-hide ExposureCompensation-hide"};
    this.state = {
      display: "LensID-hide",
      files: []
    };
  }

  update() {
    FS.enumFiles(this.props.baseDir, /\.jpg/i).then((files)=>{
      this.state.files = files;
      this.setState(this.state);
    });
  }

  render() {
    let cells;
    if (this.state.files.isEmpty()) {
      this.update();
      cells = '';
    } else {
      cells = this.state.files.map((path)=>{
        return (<ImageCell key={path} fileName={path} />);
      });
    }
    return (<div className={'imageCells ' + this.state.display}>{cells}</div>);
  }
}


class Application extends React.Component {
  render() {
    return (<div><Images baseDir={this.props.baseDir}/></div>);
  }
}




ReactDOM.render(
  (<Application baseDir='/Volumes/JetDrive330/OLYMPUS Viewer 3/'/>),
  document.getElementById('application')
);
